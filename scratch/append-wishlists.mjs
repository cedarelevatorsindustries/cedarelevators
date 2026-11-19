import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const wishlists = [
  {
    "id": "f59e805f-16b2-4380-a94f-c3e2b62e2c48",
    "user_id": null,
    "session_id": "guest_1767967239048_eol216",
    "name": "My Wishlist",
    "is_default": true,
    "created_at": "2026-01-18 07:11:44.913302+00",
    "updated_at": "2026-01-18 07:11:44.913302+00"
  },
  {
    "id": "af729071-9469-4a17-9247-b4bc55d759ad",
    "user_id": null,
    "session_id": "guest_1768806209539_kvvypv",
    "name": "My Wishlist",
    "is_default": true,
    "created_at": "2026-01-19 07:03:29.965463+00",
    "updated_at": "2026-01-19 07:03:29.965463+00"
  },
  {
    "id": "cb0df5bc-e10b-4721-9ab5-be79a5c37f1b",
    "user_id": null,
    "session_id": "guest_1768806210104_xf60ko",
    "name": "My Wishlist",
    "is_default": true,
    "created_at": "2026-01-19 07:03:30.463791+00",
    "updated_at": "2026-01-19 07:03:30.463791+00"
  },
  {
    "id": "05b9f543-9407-41ac-80f7-2e4debdfccd9",
    "user_id": null,
    "session_id": "guest_1768571591604_5jbise",
    "name": "My Wishlist",
    "is_default": true,
    "created_at": "2026-01-20 10:52:45.363532+00",
    "updated_at": "2026-01-20 10:52:45.363532+00"
  },
  {
    "id": "b56e6404-0276-42b7-b0fd-b7c3edd9b2cc",
    "user_id": null,
    "session_id": "guest_1768999309776_97pfg",
    "name": "My Wishlist",
    "is_default": true,
    "created_at": "2026-01-21 12:41:50.143923+00",
    "updated_at": "2026-01-21 12:41:50.143923+00"
  }
];

const wishlist_items = [
  {
    "id": "bd8220da-e96e-4a27-ac5d-d5cb655725a8",
    "wishlist_id": "af729071-9469-4a17-9247-b4bc55d759ad",
    "product_id": "4eeebbcf-12bd-4ca9-929f-d82a62dccd40",
    "variant_id": "a8e2d627-a302-4742-a1e3-095ca98333c1",
    "quantity": 1,
    "notes": null,
    "created_at": "2026-01-19 07:03:30.438998+00",
    "product_title": "Door Rope Roller",
    "product_thumbnail": null,
    "product_handle": "",
    "variant_title": "",
    "price": 38
  },
  {
    "id": "a183a720-fbbf-4370-9e46-2ca7f9fed164",
    "wishlist_id": "cb0df5bc-e10b-4721-9ab5-be79a5c37f1b",
    "product_id": "77a6222f-4466-49a2-9824-a00eb9a96a15",
    "variant_id": "4a7db3bd-770a-4b33-8d31-1bf779fda77d",
    "quantity": 1,
    "notes": null,
    "created_at": "2026-01-19 07:03:30.957766+00",
    "product_title": "Limit Switch - NC",
    "product_thumbnail": null,
    "product_handle": "",
    "variant_title": "",
    "price": 210
  },
  {
    "id": "0819bd0f-28fc-4b9d-9226-a8c351d0407d",
    "wishlist_id": "f59e805f-16b2-4380-a94f-c3e2b62e2c48",
    "product_id": "0bce4bd3-0bd8-421d-b2e4-68dec3ba04c0",
    "variant_id": "91132717-251c-4c92-a34e-cc36cb1d5958",
    "quantity": 1,
    "notes": null,
    "created_at": "2026-01-20 13:28:42.711106+00",
    "product_title": "Elevator Emergency Alarm",
    "product_thumbnail": "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768915239/products/emergency-wall-mount-alarm/lbpngpmfnl6imtmxcrsx.jpg",
    "product_handle": "",
    "variant_title": "",
    "price": 590
  },
  {
    "id": "5d3d8482-0a0a-415a-b6cd-096887ff37dc",
    "wishlist_id": "b56e6404-0276-42b7-b0fd-b7c3edd9b2cc",
    "product_id": "348d9d16-9ac1-4a3e-b313-e58f425726ff",
    "variant_id": "8724791b-9f4a-4fec-b76e-b3cc924dfde5",
    "quantity": 1,
    "notes": null,
    "created_at": "2026-01-21 12:41:50.610482+00",
    "product_title": "Fireman Switch",
    "product_thumbnail": "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768914793/products/fire-man-switch/tbylg1crrwrjsecdrvyq.jpg",
    "product_handle": "",
    "variant_title": "",
    "price": 650
  }
];

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${v.toString().replace(/'/g, "''")}'`;
}

function makeInsert(table, row) {
  const cols = Object.keys(row).map(c => `"${c}"`).join(', ');
  const vals = Object.values(row).map(escapeVal).join(', ');
  return `INSERT INTO public."${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
}

const localDir = 'd:/web development/cedarelevators/backups';
const extDir = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups';

[localDir, extDir].forEach(dir => {
  const jsonPath = path.join(dir, 'cedar_data_dump.json');
  const sqlPath = path.join(dir, 'cedar_data_dump.sql');

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  data.wishlists = wishlists;
  data.wishlist_items = wishlist_items;
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  let sqlAppends = '\n-- Table: public.wishlists (5 rows)\n';
  wishlists.forEach(r => sqlAppends += makeInsert('wishlists', r));
  sqlAppends += '\n-- Table: public.wishlist_items (4 rows)\n';
  wishlist_items.forEach(r => sqlAppends += makeInsert('wishlist_items', r));

  fs.appendFileSync(sqlPath, sqlAppends);
  console.log(`Updated: ${jsonPath} and ${sqlPath}`);
});

console.log('Appended 9 wishlist rows successfully! Total rows now 868.');
