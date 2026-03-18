#!/usr/bin/env python3
"""
Add real contacts from Supabase that are missing from Mailchimp.
Skips test emails and known typo emails.
"""

import urllib.request
import urllib.error
import json
import base64
import hashlib
import os
import sys

MAILCHIMP_API_KEY = os.environ.get("MAILCHIMP_API_KEY", "")
MAILCHIMP_SERVER = os.environ.get("MAILCHIMP_SERVER_PREFIX", "us14")
MAILCHIMP_LIST_ID = os.environ.get("MAILCHIMP_AUDIENCE_ID", "06f9d0f6c8")

SUPABASE_URL = "https://uvnbfnobyqbonuxztjuz.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Emails to skip: test emails, typos, and known duplicates
SKIP_EMAILS = {
    # test/dummy
    "allrecipients@example.com", "brandingtest@example.com",
    "domainverified@example.com", "finaltest@example.com",
    "testemail@example.com", "testfixed@example.com", "test@example.com",
    # your own test emails
    "jmdp872@gmail.com", "jmdp8725@gmail.com", "jmdp8726@gmail.com",
    "jmdp872028@gmail.com", "jmdp87testing@gmail.com",
    # typo emails (undeliverable)
    "caashley127@gnail.com", "elaine2023007@gmaol.com",
    "ericsnanny@gmail.comm", "tfaber1966@gmail.cim",
    "woodmann65@ail.com", "church12x12@ail.com",
    "lhapostle@yahoo.cm", "skilescindy@yahoo.co",
    "sunsetranch2013@gmaill.com", "wallyjonz@gmall.com",
    "zipposkid@yahoo.comm", "tricountypreacher@icoud.com",
    "jhenrypennstate@sncglobal.net", "drcisco1@yshoo.com",
}

def fetch_supabase_subscribers(service_key):
    all_rows = []
    page_size = 1000
    offset = 0
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "count=exact",
    }
    while True:
        range_end = offset + page_size - 1
        paged_headers = {**headers, "Range": f"{offset}-{range_end}"}
        url = f"{SUPABASE_URL}/rest/v1/subscribers?select=email,first_name,last_name&order=created_at.desc"
        req = urllib.request.Request(url, headers=paged_headers)
        with urllib.request.urlopen(req) as resp:
            rows = json.loads(resp.read())
        if not rows:
            break
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        offset += page_size
    return all_rows

def fetch_mailchimp_emails():
    auth = base64.b64encode(f"anystring:{MAILCHIMP_API_KEY}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    all_emails = set()
    offset = 0
    while True:
        url = (
            f"https://{MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/{MAILCHIMP_LIST_ID}/members"
            f"?count=1000&offset={offset}&fields=members.email_address,total_items"
        )
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
        members = data.get("members", [])
        total = data.get("total_items", 0)
        for m in members:
            all_emails.add(m["email_address"].lower().strip())
        offset += 1000
        if offset >= total or not members:
            break
    return all_emails

def batch_add_to_mailchimp(contacts):
    auth = base64.b64encode(f"anystring:{MAILCHIMP_API_KEY}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json",
    }
    members = []
    for c in contacts:
        name_parts = c["first_name"].strip().split(" ", 1)
        members.append({
            "email_address": c["email"],
            "status": "subscribed",
            "merge_fields": {
                "FNAME": c.get("first_name", "").strip(),
                "LNAME": c.get("last_name", "").strip(),
            }
        })

    payload = json.dumps({"members": members, "update_existing": False}).encode()
    url = f"https://{MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/{MAILCHIMP_LIST_ID}"
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def main():
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable")
        sys.exit(1)

    print("Fetching Mailchimp members...")
    mc_emails = fetch_mailchimp_emails()
    print(f"  {len(mc_emails)} members in Mailchimp")

    print("Fetching Supabase subscribers...")
    sb_rows = fetch_supabase_subscribers(SUPABASE_SERVICE_KEY)
    print(f"  {len(sb_rows)} rows in Supabase")

    # Find missing contacts (not in Mailchimp, not in skip list)
    to_add = []
    seen = set()
    for row in sb_rows:
        email = row["email"].lower().strip()
        if email in mc_emails or email in SKIP_EMAILS or email in seen:
            continue
        seen.add(email)
        to_add.append(row)

    if not to_add:
        print("\nNo contacts to add. All real contacts are already in Mailchimp!")
        return

    print(f"\nAdding {len(to_add)} contacts to Mailchimp:")
    for c in to_add:
        print(f"  {c['email']} — {c['first_name']} {c['last_name']}")

    print("\nSending batch to Mailchimp...")
    result = batch_add_to_mailchimp(to_add)

    added = len(result.get("new_members", []))
    updated = len(result.get("updated_members", []))
    errors = result.get("errors", [])

    print(f"\n=== DONE ===")
    print(f"  Successfully added: {added}")
    print(f"  Updated existing:   {updated}")
    print(f"  Errors:             {len(errors)}")
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  {e.get('email_address', '?')} — {e.get('error', '?')}")

if __name__ == "__main__":
    main()

