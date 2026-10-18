import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple, Optional

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "metadata.azure.com",
}

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),         # Current network
    ipaddress.ip_network("10.0.0.0/8"),        # Private Class A
    ipaddress.ip_network("100.64.0.0/10"),     # Shared address space (Carrier-grade NAT)
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local / Cloud metadata (AWS, GCP, Azure)
    ipaddress.ip_network("172.16.0.0/12"),     # Private Class B
    ipaddress.ip_network("192.0.0.0/24"),      # IETF Protocol assignments
    ipaddress.ip_network("192.0.2.0/24"),      # TEST-NET-1
    ipaddress.ip_network("192.168.0.0/16"),    # Private Class C
    ipaddress.ip_network("198.18.0.0/15"),     # Benchmarking
    ipaddress.ip_network("198.51.100.0/24"),   # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),    # TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
    ipaddress.ip_network("255.255.255.255/32"),# Broadcast
    # IPv6 ranges
    ipaddress.ip_network("::1/128"),           # IPv6 Loopback
    ipaddress.ip_network("::/128"),            # IPv6 Unspecified
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link-local
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique Local
]

def validate_url_safety(url_string: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validates that a URL does not target internal infrastructure, localhost,
    or cloud metadata endpoints (SSRF Protection).
    Returns (is_safe, error_message, resolved_ip).
    """
    if not url_string or not isinstance(url_string, str):
        return False, "URL cannot be empty.", None

    clean_url = url_string.strip()
    if not clean_url.startswith(("http://", "https://")):
        # Prepend https if scheme is missing for parsing
        clean_url = "https://" + clean_url

    try:
        parsed = urlparse(clean_url)
    except Exception as e:
        return False, f"Invalid URL structure: {str(e)}", None

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Forbidden URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.", None

    hostname = parsed.hostname
    if not hostname:
        return False, "URL hostname is missing or malformed.", None

    hostname_lower = hostname.lower().strip(".")

    # Direct hostname block
    if hostname_lower in BLOCKED_HOSTNAMES or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        return False, f"Access to internal or reserved host '{hostname_lower}' is blocked for security.", None

    # Try resolving hostname to IP
    try:
        # Check if hostname is already a direct IP
        try:
            ip_obj = ipaddress.ip_address(hostname_lower)
            resolved_ips = [ip_obj]
        except ValueError:
            # DNS resolution
            addr_info = socket.getaddrinfo(hostname_lower, None)
            resolved_ips = []
            for item in addr_info:
                ip_str = item[4][0]
                try:
                    resolved_ips.append(ipaddress.ip_address(ip_str))
                except ValueError:
                    pass
    except (socket.gaierror, socket.herror) as e:
        # DNS failed or domain does not exist
        return True, "Domain could not be resolved via DNS (possible NXDOMAIN or offline host).", None
    except Exception as e:
        return False, f"DNS resolution failed: {str(e)}", None

    for ip in resolved_ips:
        if ip.is_loopback:
            return False, f"Target IP {ip} is a loopback address and cannot be accessed.", str(ip)
        if ip.is_private:
            return False, f"Target IP {ip} belongs to a private network and cannot be accessed.", str(ip)
        if ip.is_link_local:
            return False, f"Target IP {ip} is a link-local address and cannot be accessed.", str(ip)
        if ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            return False, f"Target IP {ip} belongs to a reserved address space.", str(ip)

        for blocked_net in BLOCKED_IP_NETWORKS:
            if ip in blocked_net:
                return False, f"Target IP {ip} matches restricted network {blocked_net}.", str(ip)

    primary_ip = str(resolved_ips[0]) if resolved_ips else None
    return True, "URL passed SSRF and network safety checks.", primary_ip
