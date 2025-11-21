import mongoose from "mongoose";
import Product from "./models/Product.js";

const MONGO = process.env.MONGO_URI || "";

mongoose.connect(MONGO)
  .then(() => console.log('Mongo connected'))
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

await Product.deleteMany({});

const items = [
  {
    name: "Milk 1L",
    price: 50,
    rfidTag: "TAG001",
    imageUrl: "https://placehold.co/200",
    desc: "Dairy Milk 1L"
  },
  {
    name: "Bread",
    price: 30,
    rfidTag: "TAG002",
    imageUrl: "https://placehold.co/200",
    desc: "Brown bread"
  },
  {
    name: "Eggs (6)",
    price: 60,
    rfidTag: "TAG003",
    imageUrl: "https://placehold.co/200",
    desc: "6-piece eggs"
  }
];

await Product.insertMany(items);

console.log("Seed completed.");
process.exit(0);


// smart-shopping/
// ├─ backend/
// │  ├─ Dockerfile
// │  ├─ docker-compose.yml
// │  ├─ package.json
// │  ├─ server.js
// │  ├─ models/
// │  │  ├─ Product.js
// │  │  └─ Cart.js
// │  └─ seed.js
// └─ frontend/
//    ├─ package.json
//    ├─ vite.config.js
//    ├─ index.html
//    └─ src/
//       ├─ main.jsx
//       ├─ App.jsx
//       ├─ api/
//       │  └─ api.js
//       ├─ components/
//       │  ├─ ProductCard.jsx
//       │  ├─ CartPanel.jsx
//       │  └─ AdminProductForm.jsx
//       └─ styles/
//          └─ index.css   (Tailwind)

