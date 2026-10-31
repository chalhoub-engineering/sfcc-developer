# Product Fulfillment Tier – Implementation Guide

## 1. Overview

The Product Fulfillment Tier feature displays delivery information on the Product Detail Page (PDP) based on the selected product variations.

The implementation is available in the `app_custom_project` cartridge.

When a customer selects both **Color** and **Size**, the application retrieves the selected variant information from the request query string and calls the fulfillment mock API. The API returns a fulfillment tier based on the selected variant SKU and country code.

Based on the returned tier, the corresponding Business Manager Content Asset is displayed on the PDP.

The feature can be enabled or disabled using a custom Site Preference configured under **Storefront Configs** in Business Manager.

## 2. Implementation Flow

1. The customer opens the Product Detail Page.
2. The customer selects a product Color and Size.
3. The application checks the request query string to verify that both variation values are available.
4. If both variations are selected and contain valid values:
   - The product ID is extracted from the query string.
   - The selected Color and Size variation values are extracted.
   - The country code is identified from the current request locale.
5. The backend calls the fulfillment service with:
   - Selected Color Variant ID as the SKU.
   - Current country code.
6. The mock API returns the fulfillment tier.
7. The application uses the returned tier as the Content Asset ID.
8. The corresponding Business Manager Content Asset is retrieved and rendered on the PDP.

If either Color or Size is not selected, the fulfillment API is not called and no fulfillment content is displayed.

## 3. Product Detail Page

**PDP URL used for implementation and testing:**

https://bdcl-019.my.commercecloud.salesforce.com/s/RefArch/classic--pant/25589139M.html?lang=en_US

On this PDP:

- Select the Black color and a Size to trigger the fulfillment API and display the configured Same Day Delivery content.
- Select another available color and a Size to display the corresponding Next Day Delivery content.

The fulfillment content is displayed only after both Color and Size variations have been selected.

## 4. Postman Mock API Configuration

Postman Mock Server is used to simulate the fulfillment service response.

**Mock Server Base URL:**

https://44404cb8-63a8-4e47-a578-b54b3ad362a3.mock.pstmn.io

**API Endpoint:**

```http
GET /tier?sku={sku}&country={country}
```

**Sample Request:**

```http
GET https://44404cb8-63a8-4e47-a578-b54b3ad362a3.mock.pstmn.io/tier?sku=JJC76A0&country=US
```

**Sample Response:**

```json
{
    "sku": "JJC76A0",
    "country": "US",
    "tier": "NEXT_DAY"
}
```

### Request Parameters

| Parameter | Description |
|---|---|
| `sku` | Selected Color Variant ID passed from the PDP |
| `country` | Country code identified from the current request locale |

### Response Parameters

| Parameter | Description |
|---|---|
| `sku` | SKU received in the API request |
| `country` | Country code received in the API request |
| `tier` | Fulfillment tier returned by the mock API |

The Postman mock examples should be configured for the required SKU and country combinations to return the appropriate fulfillment tier.

## 5. Business Manager Content Asset Configuration

The fulfillment content is managed through Business Manager Content Assets. This allows content administrators to update the delivery messaging without requiring a code deployment.

The Content Asset ID must match the tier value returned by the fulfillment API.

**Example Content Asset IDs:**

| API Tier Response | Business Manager Content Asset ID |
|---|---|
| `SAME_DAY` | `SAME_DAY` |
| `NEXT_DAY` | `NEXT_DAY` |
| `STANDARD` | `STANDARD` |

### Content Rendering Logic

1. The fulfillment API returns a tier value.
2. The application uses that tier value to retrieve the matching Content Asset.
3. The Content Asset content is retrieved from Business Manager.
4. The content is rendered on the Product Detail Page.

For example, when the API returns `NEXT_DAY`, the application retrieves the Content Asset with ID `NEXT_DAY`.

Content administrators can update the text, images, and other configured content within the relevant Content Assets.

## 6. Feature Toggle – Site Preference

The fulfillment feature can be enabled or disabled using a custom Site Preference configured in Business Manager.

**Configuration location:**

Business Manager → Site Preferences → Storefront Configurations

The custom preference controls whether the fulfillment tier functionality is active.

- **Enabled:** The application executes the fulfillment tier logic when both Color and Size are selected.
- **Disabled:** The fulfillment tier functionality is skipped, and the PDP continues to work without displaying fulfillment content.

This provides a configuration-based way to enable or disable the feature without modifying the implementation code.

## 7. Cartridge Structure

The implementation is maintained in the `app_custom_project` cartridge.

Relevant implementation areas:

```text
app_custom_project/
│
├── cartridge/
│   ├── controllers/
│   │   └── Product.js
│   │
│   ├── scripts/
│   │   └── models/
│   │       └── fullfillmentModel.js
│   │
│   └── ...
│
├── caches.json
├── package.json
└── README.md
```

The controller handles the PDP variation request, while the fulfillment model handles the backend service interaction and retrieval of the corresponding Content Asset.

## 8. Testing Scenarios

| Scenario | Expected Result |
|---|---|
| No Color selected | Fulfillment API is not called |
| No Size selected | Fulfillment API is not called |
| Only Color selected | Fulfillment API is not called |
| Both Color and Size selected | Fulfillment API is called |
| API returns `SAME_DAY` | `SAME_DAY` Content Asset is displayed |
| API returns `NEXT_DAY` | `NEXT_DAY` Content Asset is displayed |
| API returns `STANDARD` | `STANDARD` Content Asset is displayed |
| Feature preference disabled | Fulfillment functionality is skipped |
| API returns an error or invalid response | PDP should continue to work without fulfillment content |
| Matching Content Asset is unavailable | Fulfillment content is not displayed |