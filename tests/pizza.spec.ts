import { test, expect } from 'playwright-test-coverage';


test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('register and observe dashboard', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { name: 'new', email: 'new@jwt.com', password: 'new' };
    const loginRes = { user: { id: 4, name: 'new', email: 'new@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('new');
  await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email address' }).fill('new@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('new');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'n', exact: true }).click();
  await expect(page.getByText('new', { exact: true })).toBeVisible();
  await page.getByText('new@jwt.com').click();
  await page.getByText('diner', { exact: true }).click();

});

//basic mock

// await page.route('*/**/api/order/menu', async (route) => {
//   const menuRes = [
//     { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
//     { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
//   ];
//   expect(route.request().method()).toBe('GET');
//   await route.fulfill({ json: menuRes });
// });

//test franchise
test('about and history', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  
  
  await page.getByRole('link', { name: 'History' }).click();
  await page.getByRole('link', { name: 'home' }).click();


});



test('admin franchise creation', async ({ page }) => {

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'a@jwt.com', password: 'a' };
    const loginRes = { user: { id: 5, name: 'Kai Chen', email: 'a@jwt.com', roles: [{ role: 'admin'}] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  



  await page.route('*/**/api/franchise', async (route) => {
    const franchiceRes = [
      {
        "id": 6,
        "name": "time",
        "admins": [
            {
                "id": 7,
                "name": "provo",
                "email": "time@jwt.com"
            }
        ],
        "stores": []
      }
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiceRes });
  });
  
  await page.route('*/**/api/franchise/8/store', async (route) => {
    const storeReq = {
      "id": "",
      "name": "Store"
    };
    const storeRes = {"id":5, "franchiseId":8, "name":"store"};
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(storeReq);
    await route.fulfill({ json: storeRes });
    
  });
  
  await page.route('*/**/api/franchise/8/store/304', async (route) => {
    const storeRes = {"message":"store deleted"};
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: storeRes });
    
  });

  await page.goto('/');
  
  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  //await expect(page.locator('#root div').filter({ hasText: 'Keep the dough rolling and' }).nth(3)).toBeVisible();
});


test('franchise store creation', async ({ page }) => {

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'f@jwt.com', password: 'f' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'f@jwt.com', roles: [{ role: 'diner' }, {"objectId": 8, role: 'franchisee'}] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  
  await page.route('*/**/api/franchise/3', async (route) => {
    const franchiceRes = [{
        "id": 8,
        "name": "provo",
        "admins": [
            {
                "id": 3,
                "name": "pizza franchisee",
                "email": "f@jwt.com"
            }
        ],
        "stores": [
            {
                "id": 304,
                "name": "byu campus store",
                "totalRevenue": 0.032
            }
        ]
    }];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiceRes });
  });
  
  await page.route('*/**/api/franchise/8/store', async (route) => {
    const storeReq = {
      "id": "",
      "name": "Store"
    };
    const storeRes = {"id":5, "franchiseId":8, "name":"store"};
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(storeReq);
    await route.fulfill({ json: storeRes });
    
  });
  
  await page.route('*/**/api/franchise/8/store/304', async (route) => {
    const storeRes = {"message":"store deleted"};
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: storeRes });
    
  });

  await page.goto('/');
  
  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('f@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('f');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByLabel('Global').getByRole('link', { name: 'Franchise' })).toBeVisible();
  

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByText('Everything you need to run an')).toBeVisible();


  await page.getByRole('row', { name: 'byu campus store 0.032 ₿ Close' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();


  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('Store');
  await page.getByRole('button', { name: 'Create' }).click();
  

  

  //await expect(page.getByRole('cell', { name: 'Store', exact: true })).toBeVisible();
  //await page.getByRole('row', { name: 'Store 0 ₿ Close' }).getByRole('button').click();
  //await page.getByRole('button', { name: 'Close' }).click();
  //await expect(page.getByRole('cell', { name: 'Store', exact: true })).not.toBeVisible();





});










/*

test('franchise store creation', async ({ page }) => {
  await page.route('*11111/ **1111/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });
});


//test admin














test('login/logout user', async ({ page }) => {
  // Mock out the service
  const menuResponse = [{ title: 'Veggie', description: 'A garden of delight' }];
  await page.route('*2/**1/api/order/menu', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuResponse });
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('c@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('c');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('buy pizza', async ({page}) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('c@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('c');
  await page.getByRole('textbox', { name: 'Password' }).press('Tab');
  await page.getByRole('button').filter({ hasText: /^$/ }).press('Tab');
  await page.getByRole('button', { name: 'Login' }).press('Enter');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Order' }).click();

  await page.getByRole('combobox').selectOption('304');
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).first().click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 1');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).first().click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByRole('button', { name: 'Pay now' }).click();
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('h3')).toContainText('valid');
  // await expect(page.getByText('{ "vendor": { "id": "ethan0')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Order more' }).click();
  await expect(page.getByText('What are you waiting for?')).toBeVisible();
  
});




*/