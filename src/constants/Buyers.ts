import images from "./images";

export const Buyers_links = [
  {
    name: "Customer Management",
    link: "/customer-mgt",
    icon: images.Users,
    sublinks: [],
    permission: "buyers.view", // Required permission to view this menu item
  },
  {
    name: "Orders Management",
    link: "/orders-mgt-buyers",
    icon: images.orders,
    sublinks: [],
    permission: "buyer_orders.view",
  },
  {
    name: "Transactions",
    link: "/transactions-buyers",
    icon: images.transaction,
    sublinks: [],
    permission: "buyer_transactions.view",
  },
];
