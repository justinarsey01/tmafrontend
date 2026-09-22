import {
  getTelegramInitData,
} from "./telegram";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const DEV_MODE =
  import.meta.env.VITE_DEV_MODE ===
  "true";


/*
|--------------------------------------------------------------------------
| Development test user
|--------------------------------------------------------------------------
*/

const DEV_USER = {

  id: "dev-user-001",

  telegramId: "123456789",

  username: "coinearn_test",

  firstName: "CoinEarn",

  lastName: "Tester",

  photoUrl: null,

};


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export interface TelegramUser {

  id: string;

  telegramId: string;

  username: string | null;

  firstName: string | null;

  lastName: string | null;

  photoUrl: string | null;

}


export interface MiningState {

  energy: number;

  last_energy_update: string;

}


export interface LoginResult {

  success: boolean;

  user: TelegramUser;

  balance: number;

  mining: MiningState;

}


export interface Task {

  id: string;

  title: string;

  description: string | null;

  type: string;

  target: string;

  reward: number;

}


export interface SmmService {

  id: string;

  name: string;

  category: string;

  description: string | null;

  sellingPrice: number;

  minQuantity: number;

  maxQuantity: number;

  active: boolean;

}


export interface SmmOrderResult {

  id: string;

  orderNumber: number;

  amount: number;

  balance: number;

  status: string;

}


/*
|--------------------------------------------------------------------------
| Authentication headers
|--------------------------------------------------------------------------
*/

function getAuthHeaders(): HeadersInit {

  const initData =
    getTelegramInitData();


  if (!initData) {

    throw new Error(
      "Telegram authentication data is unavailable."
    );

  }


  return {

    "Content-Type":
      "application/json",

    Authorization:
      `tma ${initData}`,

  };

}


/*
|--------------------------------------------------------------------------
| Telegram login
|--------------------------------------------------------------------------
*/

export async function telegramLogin(): Promise<LoginResult> {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development mode
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    const storedBalance =
      localStorage.getItem(
        "coinEarnDevBalance"
      );


    const storedEnergy =
      localStorage.getItem(
        "coinEarnEnergy"
      );


    const storedEnergyTime =
      localStorage.getItem(
        "coinEarnEnergyTime"
      );


    return {

      success: true,

      user: DEV_USER,

      balance:
        Number(
          storedBalance || 0
        ),

      mining: {

        energy:
          Number(
            storedEnergy || 1000
          ),

        last_energy_update:
          storedEnergyTime ||
          new Date().toISOString(),

      },

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Production login
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/auth/telegram`,
      {

        method: "POST",

        headers:
          getAuthHeaders(),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Authentication failed"
    );

  }


  return data;

}


/*
|--------------------------------------------------------------------------
| Mining
|--------------------------------------------------------------------------
*/

export async function mineCoin() {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development mining
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    const currentBalance =
      Number(
        localStorage.getItem(
          "coinEarnDevBalance"
        ) || 0
      );


    const currentEnergy =
      Number(
        localStorage.getItem(
          "coinEarnEnergy"
        ) || 1000
      );


    if (currentEnergy <= 0) {

      throw new Error(
        "No mining energy available"
      );

    }


    const newBalance =
      currentBalance + 1;


    const newEnergy =
      currentEnergy - 1;


    localStorage.setItem(
      "coinEarnDevBalance",
      String(newBalance)
    );


    localStorage.setItem(
      "coinEarnEnergy",
      String(newEnergy)
    );


    localStorage.setItem(
      "coinEarnEnergyTime",
      new Date().toISOString()
    );


    return {

      success: true,

      balance:
        newBalance,

      energy:
        newEnergy,

      last_energy_update:
        new Date().toISOString(),

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Production mining
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/mining/tap`,
      {

        method: "POST",

        headers:
          getAuthHeaders(),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Mining failed"
    );

  }


  return data;

}


/*
|--------------------------------------------------------------------------
| Get Tasks
|--------------------------------------------------------------------------
*/

export async function getTasks(): Promise<Task[]> {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development tasks
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    return [

      {

        id:
          "dev-task-1",

        title:
          "Join CoinEarn Telegram Channel",

        description:
          "Join our official Telegram channel and earn 100 Coins.",

        type:
          "telegram",

        target:
          "@CoinEarnOfficial",

        reward:
          100,

      },

    ];

  }


  /*
  |--------------------------------------------------------------------------
  | Production tasks
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/tasks`,
      {

        method: "GET",

        headers:
          getAuthHeaders(),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Could not load tasks"
    );

  }


  return data.tasks || [];

}


/*
|--------------------------------------------------------------------------
| Complete Task
|--------------------------------------------------------------------------
*/

export async function completeTask(
  taskId: string
) {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development mode
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    const currentBalance =
      Number(
        localStorage.getItem(
          "coinEarnDevBalance"
        ) || 0
      );


    const reward = 100;


    const newBalance =
      currentBalance + reward;


    localStorage.setItem(
      "coinEarnDevBalance",
      String(newBalance)
    );


    return {

      success: true,

      reward,

      balance:
        newBalance,

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Production
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/tasks/complete`,
      {

        method: "POST",

        headers:
          getAuthHeaders(),

        body:
          JSON.stringify({
            taskId,
          }),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Could not complete task"
    );

  }


  return data;

}


/*
|--------------------------------------------------------------------------
| GET SMM SERVICES
|--------------------------------------------------------------------------
*/

export async function getServices(): Promise<SmmService[]> {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development services
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    return [

      {

        id:
          "dev-members",

        name:
          "Telegram Members",

        category:
          "Telegram",

        description:
          "Increase members in your Telegram community.",

        sellingPrice:
          500,

        minQuantity:
          100,

        maxQuantity:
          10000,

        active:
          true,

      },

      {

        id:
          "dev-reactions",

        name:
          "Telegram Reactions",

        category:
          "Telegram",

        description:
          "Add reactions to Telegram posts.",

        sellingPrice:
          300,

        minQuantity:
          10,

        maxQuantity:
          10000,

        active:
          true,

      },

      {

        id:
          "dev-views",

        name:
          "Telegram Views",

        category:
          "Telegram",

        description:
          "Increase views on Telegram posts.",

        sellingPrice:
          200,

        minQuantity:
          100,

        maxQuantity:
          100000,

        active:
          true,

      },

    ];

  }


  /*
  |--------------------------------------------------------------------------
  | Production
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/services`,
      {

        method: "GET",

        headers:
          getAuthHeaders(),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Could not load services"
    );

  }


  return data.services || [];

}


/*
|--------------------------------------------------------------------------
| CREATE SMM ORDER
|--------------------------------------------------------------------------
*/

export async function createSmmOrder(
  serviceId: string,
  target: string,
  quantity: number
): Promise<SmmOrderResult> {

  const initData =
    getTelegramInitData();


  /*
  |--------------------------------------------------------------------------
  | Development order
  |--------------------------------------------------------------------------
  */

  if (
    DEV_MODE &&
    !initData
  ) {

    const services =
      await getServices();


    const service =
      services.find(
        (item) =>
          item.id === serviceId
      );


    if (!service) {

      throw new Error(
        "Service not found"
      );

    }


    if (
      quantity <
      service.minQuantity
    ) {

      throw new Error(
        `Minimum quantity is ${service.minQuantity}`
      );

    }


    if (
      quantity >
      service.maxQuantity
    ) {

      throw new Error(
        `Maximum quantity is ${service.maxQuantity}`
      );

    }


    const amount =
      Math.ceil(
        (
          quantity *
          service.sellingPrice
        ) / 1000
      );


    const currentBalance =
      Number(
        localStorage.getItem(
          "coinEarnDevBalance"
        ) || 0
      );


    if (
      currentBalance <
      amount
    ) {

      throw new Error(
        "Insufficient Coin balance"
      );

    }


    const newBalance =
      currentBalance - amount;


    localStorage.setItem(
      "coinEarnDevBalance",
      String(newBalance)
    );


    const orderNumber =
      Number(
        localStorage.getItem(
          "coinEarnDevOrderNumber"
        ) || 1000
      ) + 1;


    localStorage.setItem(
      "coinEarnDevOrderNumber",
      String(orderNumber)
    );


    return {

      id:
        `dev-order-${Date.now()}`,

      orderNumber,

      amount,

      balance:
        newBalance,

      status:
        "pending",

    };

  }


  /*
  |--------------------------------------------------------------------------
  | Production order
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${API_URL}/api/orders`,
      {

        method: "POST",

        headers:
          getAuthHeaders(),

        body:
          JSON.stringify({

            serviceId,

            target,

            quantity,

          }),

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Could not create order"
    );

  }


  return data.order;

}