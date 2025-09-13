import images from "../../../constants/images";

export interface User {
  id: number;
  name: string;
  position: number;
  balance: string;
  pointsBalance: number;
  userType: string;
  avatar: string;
}

export const leaderboardUsers: User[] = [
  {
    id: 1,
    name: "Danny Stores",
    position: 4,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 2,
    name: "Danny Stores",
    position: 5,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 3,
    name: "Danny Stores",
    position: 6,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 4,
    name: "Danny Stores",
    position: 7,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 5,
    name: "Danny Stores",
    position: 8,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 6,
    name: "Danny Stores",
    position: 9,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  },
  {
    id: 7,
    name: "Danny Stores",
    position: 10,
    balance: "N250,000",
    pointsBalance: 800,
    userType: "Seller",
    avatar: images.admin
  }
];
