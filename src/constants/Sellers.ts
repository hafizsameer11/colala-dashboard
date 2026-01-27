import images from "./images";

export const Sellers_links = [
    {
        name: "Stores Management",
        link: "/stores-mgt",
        icon: images.Users,
        sublinks: [],
        permission: "sellers.view",
    },
    {
        name: "Orders Management",
        link: "/orders-mgt-sellers",
        icon: images.orders,
        sublinks: [],
        permission: "seller_orders.view",
    },
    {
        name: "Transactions",
        link: "/transactions-sellers",
        icon: images.transaction,
        sublinks: [],
        permission: "seller_transactions.view",
    },
    {
        name: "Products/Services",
        link: "/products-services",
        icon: images.products,
        sublinks: [],
        permission: "products.view",
    },
        {
        name: "Store KYC",
        link: "/store-kyc",
        icon: images.store,
        sublinks: [],
        permission: "kyc.view",
    },
        {
        name: "Subscriptions",
        link: "/subscriptions",
        icon: images.subscriptions,
        sublinks: [],
        permission: "subscriptions.view",
    },
            {
        name: "Promotions",
        link: "/promotions",
        icon: images.promotions,
        sublinks: [],
        permission: "promotions.view",
    },
                {
        name: "Social Feed",
        link: "/social-feed",
        icon: images.socialfeed,
        sublinks: [],
        permission: "social_feed.view",
    },
];