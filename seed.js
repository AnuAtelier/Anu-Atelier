const fs = require('fs');
const path = require('path');

const initialProducts = [
    {
        id: "prod_1",
        name: "A Cute Little Girl Hand Stitching Clothes",
        description: "A beautiful handcrafted representation of a little girl stitching clothes.",
        price: 500,
        categoryId: "embroidered-clothes",
        categoryName: "Embroidered & Hand-Stitched",
        subcategoryId: "kurtis",
        subcategoryName: "Kurtis",
        image: "img/placeholder.png",
        stock: 10,
        status: "published",
        createdAt: Date.now() - 100000
    },
    {
        id: "prod_2",
        name: "Colorful Applique Pouch",
        description: "A vibrant handmade applique pouch.",
        price: 799,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "jute-bags",
        subcategoryName: "Jute Bags",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpijLGyKIV-d9VrEGbWzLLHe44J1P3BFvgHJq4E9d7gA&s=10",
        stock: 15,
        status: "published",
        createdAt: Date.now() - 90000
    },
    {
        id: "prod_3",
        name: "Sashiko Embroidered Jeans",
        description: "Upcycled denim with beautiful Sashiko embroidery.",
        price: 2499,
        categoryId: "embroidered-clothes",
        categoryName: "Embroidered & Hand-Stitched",
        subcategoryId: "jackets",
        subcategoryName: "Jackets",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHAZqy4uNX9_yihi4CXgNAhsSr7c9Q4f6MovYgs9Xe8A&s=10",
        stock: 5,
        status: "published",
        createdAt: Date.now() - 80000
    },
    {
        id: "prod_4",
        name: "Floral Fairy Light Hoop",
        description: "A glowing floral fairy light hoop for home decor.",
        price: 1299,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "macrame-hangings",
        subcategoryName: "Macrame Hangings",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4_rZRO56o2R8ll_Fy1qnzC7fXqMm_IjfT0W_0IV1OdQ&s=10",
        stock: 8,
        status: "published",
        createdAt: Date.now() - 70000
    },
    {
        id: "prod_5",
        name: "Bright Yarn Flower Hanging",
        description: "Colorful yarn flower wall hanging.",
        price: 999,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "macrame-hangings",
        subcategoryName: "Macrame Hangings",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXr2u7o7lkBiPl-MEsNkGFGgLCDdQh0nF3o9S0PB3izA&s=10",
        stock: 12,
        status: "published",
        createdAt: Date.now() - 60000
    },
    {
        id: "prod_6",
        name: "Tiny Woven Daisy Basket",
        description: "Miniature woven basket with daisy details.",
        price: 599,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "bamboo-baskets",
        subcategoryName: "Bamboo Baskets",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmvGxiNqCibZWaa070PMZ3JZGA3Fr4lz68cAi_iWoE0A&s=10",
        stock: 20,
        status: "published",
        createdAt: Date.now() - 50000
    },
    {
        id: "prod_7",
        name: "Floral Embroidered Beanie",
        description: "Warm beanie with delicate floral embroidery.",
        price: 699,
        categoryId: "embroidered-clothes",
        categoryName: "Embroidered & Hand-Stitched",
        subcategoryId: "scarves",
        subcategoryName: "Scarves",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdN7QGCSpJx-JLAZtb2LMZLi68He6hI_iyjX3yxROCfA&s=10",
        stock: 25,
        status: "published",
        createdAt: Date.now() - 40000
    },
    {
        id: "prod_8",
        name: "Hand-stitched Fabric Motifs",
        description: "Beautiful hand-stitched fabric motifs for applique.",
        price: 349,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "jute-bags", // Defaulting appropriately
        subcategoryName: "Jute Bags",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1_b2ZJsjCwOH9gJ1RFzYFCb0VxNj8YOmGjeJD2y1v0A&s=10",
        stock: 30,
        status: "published",
        createdAt: Date.now() - 30000
    },
    {
        id: "prod_9",
        name: "Patchwork Boro Pillow",
        description: "Comfortable pillow with patchwork Boro design.",
        price: 1499,
        categoryId: "other-handicrafts",
        categoryName: "Other Handicrafts",
        subcategoryId: "rugs",
        subcategoryName: "Rugs",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDLuh12PswfHbASigaUtRXLglqQKclRBX2lL_2C_GHA&s=10",
        stock: 10,
        status: "published",
        createdAt: Date.now() - 20000
    }
];

fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(initialProducts, null, 2));
console.log('Successfully seeded products.json');
