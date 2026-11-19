function isNonEmptyString(value) {
  // trims before checking length so whitespace-only strings considered empty
  return typeof value === "string" && value.trim().length > 0;
}

function findProductById(products, productId) {
  return products.find(product => product.id === productId);
}

function findCustomerById(customers, customerId) {
  return customers.find(customer => customer.id === customerId);
}

function validateOrder(order, products, customers) {
  const errors = [];

  // applies blank-string check to order IDs as well
  if (!order.id || (typeof order.id === "string" && !isNonEmptyString(order.id))) {
    errors.push("Order is missing an id");
  }

  if (!isNonEmptyString(order.customerId)) {
    errors.push("Order is missing a customer id");
  }

  const customer = findCustomerById(customers, order.customerId);
  if (!customer) {
    errors.push("Customer does not exist");
  }

  // rejects missing / empty / non-array lists
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push("Order must contain at least one item");
    return errors;
  }

  const requestedQuantities = new Map();
  for (const item of order.items) {
    // reports missing product when item is null / undefined
    const productId = item?.productId;
    const product = findProductById(products, productId);

    if (!product) {
      errors.push(`Product does not exist: ${productId}`);
      continue;
    }

    // requires positive integer before checking stock
    const quantity = item.quantity;
    if (!Number.isInteger(quantity)) {
      errors.push(`Invalid quantity for ${product.name}`);
      continue;
    }
    if (quantity <= 0) {
      errors.push(`Quantity must be positive for ${product.name}`);
      continue;
    }

    // adds quantities across repeated product lines
    const requestedQuantity = (requestedQuantities.get(productId) ?? 0) + quantity;
    requestedQuantities.set(productId, requestedQuantity);
    if (requestedQuantity > product.stock) {
      errors.push(`Not enough inventory for ${product.name}`);
    }
  }

  return errors;
}

module.exports = {
  isNonEmptyString,
  findProductById,
  findCustomerById,
  validateOrder
};
