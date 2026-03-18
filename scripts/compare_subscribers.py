#!/usr/bin/env python3
"""
Compare Mailchimp audience vs Supabase subscribers table.
Identifies contacts in Supabase but missing from Mailchimp.
"""

import urllib.request
import json
import base64
import os
import sys

# --- Config ---
MAILCHIMP_API_KEY = os.environ.get("MAILCHIMP_API_KEY", "")
MAILCHIMP_SERVER = os.environ.get("MAILCHIMP_SERVER_PREFIX", "us14")
MAILCHIMP_LIST_ID = os.environ.get("MAILCHIMP_AUDIENCE_ID", "06f9d0f6c8")

SUPABASE_URL = "https://uvnbfnobyqbonuxztjuz.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

def fetch_mailchimp_members():
    auth = base64.b64encode(f"anystring:{MAILCHIMP_API_KEY}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    all_emails = set()
    offset = 0
    count = 1000

    while True:
        url = (
            f"https://{MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/{MAILCHIMP_LIST_ID}/members"
            f"?count={count}&offset={offset}&fields=members.email_address,total_items"
        )
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())

        members = data.get("members", [])
        total = data.get("total_items", 0)

        for m in members:
            all_emails.add(m["email_address"].lower().strip())

        offset += count
        print(f"  Mailchimp: fetched {min(offset, total)}/{total} members...", file=sys.stderr)

        if offset >= total or not members:
            break

    return all_emails

def fetch_supabase_subscribers(service_key):
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "count=exact",
    }
    all_rows = []
    page_size = 1000
    offset = 0

    while True:
        range_end = offset + page_size - 1
        paged_headers = {**headers, "Range": f"{offset}-{range_end}"}
        url = f"{SUPABASE_URL}/rest/v1/subscribers?select=email,first_name,last_name,source,created_at&order=created_at.desc"
        req = urllib.request.Request(url, headers=paged_headers)
        with urllib.request.urlopen(req) as resp:
            rows = json.loads(resp.read())
        if not rows:
            break
        all_rows.extend(rows)
        print(f"  Supabase: fetched {len(all_rows)} subscribers...", file=sys.stderr)
        if len(rows) < page_size:
            break
        offset += page_size

    return all_rows

def main():
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    print("Fetching Mailchimp members...", file=sys.stderr)
    mc_emails = fetch_mailchimp_members()
    print(f"\nMailchimp total unique emails: {len(mc_emails)}", file=sys.stderr)

    print("Fetching Supabase subscribers...", file=sys.stderr)
    sb_rows = fetch_supabase_subscribers(SUPABASE_SERVICE_KEY)
    sb_emails = {r["email"].lower().strip() for r in sb_rows}
    print(f"Supabase total unique emails: {len(sb_emails)}", file=sys.stderr)

    # Find contacts in Supabase but NOT in Mailchimp
    missing_from_mc = sb_emails - mc_emails
    # Find contacts in Mailchimp but NOT in Supabase
    missing_from_sb = mc_emails - sb_emails

    print(f"\n=== RESULTS ===")
    print(f"Mailchimp members:   {len(mc_emails)}")
    print(f"Supabase subscribers: {len(sb_emails)}")
    print(f"In Supabase but MISSING from Mailchimp: {len(missing_from_mc)}")
    print(f"In Mailchimp but not in Supabase: {len(missing_from_sb)}")

    if missing_from_mc:
        print(f"\n--- Contacts in Supabase but missing from Mailchimp ---")
        # Look up full details from Supabase rows
        detail_map = {r["email"].lower().strip(): r for r in sb_rows}
        for email in sorted(missing_from_mc):
            row = detail_map.get(email, {})
            name = f"{row.get('first_name', '')} {row.get('last_name', '')}".strip()
            source = row.get("source", "")
            created = row.get("created_at", "")[:10]
            print(f"  {email} | {name} | {source} | {created}")

if __name__ == "__main__":
    main()

