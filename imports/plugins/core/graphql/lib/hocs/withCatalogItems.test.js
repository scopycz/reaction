import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getCatalogItems from "../queries/getCatalogItems";
import withCatalogItems from "./withCatalogItems";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const fakeOpaqueTagId = "cmVhY3Rpb24vdGFnOnJwakN2VEJHamhCaTJ4ZHJv";
const fakeCatalogItemsConnection = {
  __typename: "CatalogItemConnection",
  "totalCount": 1,
  "pageInfo": {
    "endCursor": "N3l4bmdxZm13TUFrQVR5SzU=",
    "startCursor": "N3l4bmdxZm13TUFrQVR5SzU=",
    "hasNextPage": false,
    "hasPreviousPage": false,
    __typename: "PageInfo"
  },
  "edges": [
    {
      "__typename": "CatalogItemEdge",
      "cursor": "N3l4bmdxZm13TUFrQVR5SzU=",
      "node": {
        "__typename": "CatalogItemProduct",
        "_id": "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06N3l4bmdxZm13TUFrQVR5SzU=",
        "product": {
          "__typename": "CatalogProduct",
          "_id": "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6QkNUTVo2SFR4RlNwcEpFU2s=",
          "title": "Basic Reaction Producdts",
          "slug": "basic-reaction-product",
          "description": "Sign in as administrator to edit.\nYou can clone this product from the product grid.\nYou can upload images click or drag in image box on the left here.\nTag this product below, and then add tag in navigation.\nClick the bookmark in the tag to set product url.\nOption variants, price, quantity, and child variants are created by clicking on the variant below, clone the variant to add more options.\nDetails can be added below the image for more specific product information.\n Login next to the cart, and then click the dashboard icon for more tools.",
          "vendor": "Example Manufacturer",
          "isLowQuantity": false,
          "isSoldOut": false,
          "isBackorder": false,
          "shop": {
            "__typename": "Shop",
            "currency": {
              "__typename": "Currency",
              "code": "USD"
            }
          },
          "pricing": [
            {
              "__typename": "ProductPricingInfo",
              "currency": {
                "__typename": "Currency",
                "code": "USD"
              },
              "displayPrice": "$12.99 - $19.99",
              "minPrice": 12.99,
              "maxPrice": 19.99
            }
          ],
          "primaryImage": null
        }
      }
    }
  ]
};

const MockComponent = () => <div>Mock</div>;
const TestComponent = withCatalogItems(MockComponent);
const mocks = [
  {
    request: {
      query: getCatalogItems,
      variables: {
        shopId: fakeOpaqueShopId,
        tagIds: [fakeOpaqueTagId]
      }
    },
    result: {
      data: {
        catalogItems: fakeCatalogItemsConnection
      }
    }
  },
  {
    request: {
      query: getCatalogItems,
      variables: {
        shopId: "invalidShopId"
      }
    },
    result: {
      data: {
        catalogItems: null
      }
    }
  }
];

test("renders child component with correct catalogItems connection", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks}>
      <TestComponent shopId={fakeOpaqueShopId} tagId={fakeOpaqueTagId} />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingCatalogItems");

  const catalogItems = wrapper.find("MockComponent").prop("catalogItems");
  expect(typeof catalogItems).toBe("object");

  const {
    totalCount,
    pageInfo: {
      startCursor,
      endCursor
    },
    edges: [
      {
        cursor,
        node: {
          _id
        }
      }
    ]
  } = fakeCatalogItemsConnection;

  expect(catalogItems.totalCount).toBe(totalCount);
  expect(typeof catalogItems.pageInfo).toBe("object");
  expect(catalogItems.pageInfo.startCursor).toBe(startCursor);
  expect(catalogItems.pageInfo.endCursor).toBe(endCursor);
  expect(Array.isArray(catalogItems.edges)).toBe(true);
  expect(typeof catalogItems.edges[0].node).toBe("object");
  expect(catalogItems.edges[0].node._id).toBe(_id);
});

test("doesn't query GraphQL if no shopId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks}>
      <TestComponent />
    </MockedProvider>
  ));

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("catalogItems")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoadingCatalogItems")).toBe(undefined);
});

test("returns an empty object for catalogItems if invalid shopId is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks}>
      <TestComponent shopId="invalidShopId" />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoadingCatalogItems");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("catalogItems")).toEqual({});
});