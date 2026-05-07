# Walkthrough: SQLite Support with DB Switching

## Summary

Added SQLite as an alternative database backend to the BitLinks URL shortener. A `DB_TYPE` env variable controls which backend is used (`sqlite` or `mongodb`). The existing MongoDB path is fully preserved.

## Architecture

```mermaid
graph TD
    A["route.js / page.js"] --> B["db.js (router)"]
    B -->|DB_TYPE=mongodb| C["mongo-adapter.js"]
    B -->|DB_TYPE=sqlite| D["sqlite-adapter.js"]
    C --> E["mongodb.js (existing)"]
    D --> F["database/database.db"]
```

## Files Changed

### New Files
| File | Purpose |
|---|---|
| [db.js](file:///d:/micro/github/BitLinks-url-Shortner/app/lib/db.js) | Unified entry point — reads `DB_TYPE` and re-exports the correct adapter |
| [mongo-adapter.js](file:///d:/micro/github/BitLinks-url-Shortner/app/lib/mongo-adapter.js) | MongoDB adapter wrapping existing `clientPromise` |
| [sqlite-adapter.js](file:///d:/micro/github/BitLinks-url-Shortner/app/lib/sqlite-adapter.js) | SQLite adapter using `better-sqlite3`, auto-creates DB folder/file |

### Modified Files

#### [route.js](file:///d:/micro/github/BitLinks-url-Shortner/app/api/generate/route.js)
```diff:route.js
import clientPromise from "@/app/lib/mongodb"

export async function POST(request) {

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('bitLinks');
    const collection = db.collection('links');

    // if shorturl already exists
    const shortUrlExists = await collection.findOne({shortUrl : body.shortUrl});
    if(shortUrlExists){
        return Response.json({success: false, error: true, message: 'short URL already exists'}, {
            status: 400
        });
    }

    const result = await collection.insertOne({
        url:body.url,
        shortUrl: body.shortUrl,
    }); 

    return Response.json({success: true , error: false, message: 'Short URL generated successfully' })
  }
===
import { findLink, insertLink } from "@/app/lib/db"

export async function POST(request) {

    const body = await request.json();

    // if shorturl already exists
    const shortUrlExists = await findLink(body.shortUrl);
    if(shortUrlExists){
        return Response.json({success: false, error: true, message: 'short URL already exists'}, {
            status: 400
        });
    }

    await insertLink(body.url, body.shortUrl);

    return Response.json({success: true , error: false, message: 'Short URL generated successfully' })
  }
```

#### [page.js](file:///d:/micro/github/BitLinks-url-Shortner/app/%5Bshorturl%5D/page.js)
```diff:page.js
import { redirect } from "next/navigation"
import clientPromise from "../lib/mongodb"

export default async function Page({ params }) {
    const shorturl = (await params).shorturl
    const client = await clientPromise;
    const db = client.db('bitLinks');
    const collection = db.collection('links');


    const shortUrlExists = await collection.findOne({shortUrl : shorturl});
    if(shortUrlExists){
         redirect(shortUrlExists.url);
    }
    else{
        redirect(process.env.NEXT_PUBLIC_BASE_URL)
    }

    return <div>My Post: {url}</div>
  }
===
import { redirect } from "next/navigation"
import { findLink } from "@/app/lib/db"

export default async function Page({ params }) {
    const shorturl = (await params).shorturl

    const shortUrlExists = await findLink(shorturl);
    if(shortUrlExists){
         redirect(shortUrlExists.url);
    }
    else{
        redirect(process.env.NEXT_PUBLIC_BASE_URL)
    }

    return <div>My Post: {url}</div>
  }
```

#### [next.config.mjs](file:///d:/micro/github/BitLinks-url-Shortner/next.config.mjs)
```diff:next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
===
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
```

#### [.env](file:///d:/micro/github/BitLinks-url-Shortner/.env)
```diff:.env
NEXT_PUBLIC_BASE_URL= http://localhost:3000
MONGODB_URI= mongodb+srv://nagaravi259_db_user:ygccXUgWgiqAQFz5@copy-trading-test.md1cos1.mongodb.net/?appName=copy-trading-test
===
NEXT_PUBLIC_BASE_URL= http://localhost:3000
MONGODB_URI= mongodb+srv://nagaravi259_db_user:ygccXUgWgiqAQFz5@copy-trading-test.md1cos1.mongodb.net/?appName=copy-trading-test
DB_TYPE=sqlite
```

#### [.gitignore](file:///d:/micro/github/BitLinks-url-Shortner/.gitignore)
```diff:.gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for commiting if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
===
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for commiting if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# sqlite database
/database
```

## Verification

- ✅ Dev server starts without errors with `DB_TYPE=sqlite`
- ✅ `database/database.db` auto-created on first request
- ✅ Short URL creation works (`POST /api/generate` → 200)
- ✅ Short URL redirect works (`GET /testgoogle` → 307 redirect to google.com)

## How to Switch

```env
# Use SQLite (default)
DB_TYPE=sqlite

# Use MongoDB
DB_TYPE=mongodb
```
