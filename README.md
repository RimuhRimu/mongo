# deno_mongo

> **deno_mongo** is a **MongoDB** database driver developed for Deno. supports
> Deno Deploy as well.

<div align="center">
  <img src="https://user-images.githubusercontent.com/47688578/168461127-aeadaaf5-224d-4664-8a1d-4789c4ee9281.jpg" width="210">
</div>

## ATTENTION

**Deno have added the support for npm modules. so you can also use `npm:mongodb`
driver from now.**\
Each of these two drivers has its own advantages and disadvantages. you can
follow [this](https://github.com/denodrivers/mongo/issues/380) issue for more
details. In short:

- if you want to use basic MongoDB operations and you don't care about
  stability, this driver just works.
- if you want most of MongoDB feature working with Deno and you don't care about
  the possible overheads by using node compat layer, you may try the
  `npm:mongodb` driver
- if you are using MongoDB Atlas, using
  [atlas_sdk](https://github.com/erfanium/atlas_sdk) can be your best option.

[![tag](https://img.shields.io/github/tag/manyuanrong/deno_mongo.svg)](https://github.com/manyuanrong/deno_mongo/releases)
[![Build Status](https://github.com/manyuanrong/deno_mongo/workflows/ci/badge.svg?branch=main)](https://github.com/manyuanrong/deno_mongo/actions)
[![license](https://img.shields.io/github/license/manyuanrong/deno_mongo.svg)](https://github.com/manyuanrong/deno_mongo)
[![Discord server](https://img.shields.io/discord/768918486575480863?color=blue&label=Ask%20for%20help%20here&logo=discord&style=flat-square)](https://discord.gg/HEdTCvZUSf)

## Links

- [Docs](https://doc.deno.land/https/deno.land/x/mongo/mod.ts)

### Import

Replace `LATEST_VERSION` with
[current latest version](https://deno.land/x/mongo)

```ts
import {
  Bson,
  MongoClient,
} from "https://deno.land/x/mongo@LATEST_VERSION/mod.ts";
```

### Connect

```ts
const client = new MongoClient();

// Connecting to a Local Database
await client.connect("mongodb://127.0.0.1:27017");

// Connecting to a Mongo Atlas Database
await client.connect({
  db: "<db_name>",
  tls: true,
  servers: [
    {
      host: "<db_cluster_url>",
      port: 27017,
    },
  ],
  credential: {
    username: "<username>",
    password: "<password>",
    db: "<db_name>",
    mechanism: "SCRAM-SHA-1",
  },
});

// Connect using srv url
await client.connect(
  "mongodb+srv://<username>:<password>@<db_cluster_url>/<db_name>?authMechanism=SCRAM-SHA-1",
);
```

### Access Collection

```ts
// Defining schema interface
interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
}

const db = client.database("test");
const users = db.collection<UserSchema>("users");
```

### Insert

```ts
const insertId = await users.insertOne({
  username: "user1",
  password: "pass1",
});

const insertIds = await users.insertMany([
  {
    username: "user1",
    password: "pass1",
  },
  {
    username: "user2",
    password: "pass2",
  },
]);
```

### Find

```ts
const user1 = await users.findOne({ _id: insertId });

const all_users = await users.find({ username: { $ne: null } }).toArray();

// find by ObjectId
const user1_id = await users.findOne({
  _id: new ObjectId("SOME OBJECTID STRING"),
});

// use the option { noCursorTimeout: false } if you are using a shared cluster
// see https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
const user1 = await users.findOne({...},{ noCursorTimeout: false });
const all_users = await users.find({...},{ noCursorTimeout: false }).toArray();
```

### Count

```ts
const count = await users.countDocuments({ username: { $ne: null } });

const estimatedCount = await users.estimatedDocumentCount({
  username: { $ne: null },
});
```

### Aggregation

```ts
const docs = await users.aggregate([
  { $match: { username: "many" } },
  { $group: { _id: "$username", total: { $sum: 1 } } },
]).toArray();
```

### Update

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.updateOne(
  { username: { $ne: null } },
  { $set: { username: "USERNAME" } },
);

const { matchedCount, modifiedCount, upsertedId } = await users.updateMany(
  { username: { $ne: null } },
  { $set: { username: "USERNAME" } },
);
```

### Replace

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.replaceOne(
  { username: "a" },
  {
    username: "user1",
    password: "pass1",
  }, // new document
);
```

### Delete

```ts
const deleteCount = await users.deleteOne({ _id: insertId });

const deleteCount2 = await users.deleteMany({ username: "test" });
```

### Cursor methods

```ts
const cursor = users.find();

// Skip & Limit
cursor.skip(10).limit(10);

// iterate results
for await (const user of cursor) {
  console.log(user);
}

// or save results to array (uses more memory)
const users = await cursor.toArray();
```

### GridFS

```ts
// Upload
const bucket = new GridFSBucket(db);
const upstream = bucket.openUploadStream("test.txt");

const writer = upstream.getWriter();
writer.write(fileContents);

await writer.close();

// Download
const file = await new Response(bucket.openDownloadStream(id)).text();
```

## Community Resources

### Tools

- [atlas_sdk](https://github.com/erfanium/atlas_sdk) TypeSafe MongoDB Atlas Data
  API SDK for Deno & Deno Deploy
- [dangoDB](https://github.com/oslabs-beta/dangoDB) A MongoDB ODM for Deno
- [denomongo-unittest-utils](https://github.com/Gang-of-Fork/denomongo-unittest-utils)
  mock mongo-collections for use in unit-tests

### Examples

- [deno-deploy-mongo](https://github.com/erfanium/deno-deploy-mongo) A simple
  app with Deno, MongoDB and oak deployed on Deno Deploy and MongoDB Atlas
- [deno_rest](https://github.com/vicky-gonsalves/deno_rest) A simple oak based
  boilerplate for RESTful apis using deno_mongo

## Contributing

### Local testing with Docker

1. `docker run -d  -p 27017:27017 mongo`
2. deno test -A
