const { applyDiscounts } = require("./discounts");
const { reserveInventory } = require("./inventory");
const { findCustomerById, findProductById, validateOrder } = require("./validators");

function calculateSubtotal(order, products) {
  let subtotal = 0;

  for (const item of order.items) {
    const product = findProductById(products, item.productId);
    if (!product) continue;
    // subtotal multiplies product price by quantity
    subtotal += product.price * item.quantity;
  }
  // round later
  return subtotal;
}

function calculateTax(customer, discountedSubtotal, taxRates) {
  // missing states use a 0% tax rate
  const state = customer?.state;
  const rate =
    state && Object.prototype.hasOwnProperty.call(taxRates, state)
      ? taxRates[state]
      : 0;
  // round later
  return discountedSubtotal * rate;
}

function calculateShipping(discountedSubtotal) {
  if (discountedSubtotal > 100) {
    return 0;
  }
  return 8.99;
}

function processOrder(order, products, customers, taxRates) {
  const customer = findCustomerById(customers, order.customerId);
  const errors = validateOrder(order, products, customers);

  const subtotal = calculateSubtotal(order, products);
  const discounts = applyDiscounts(order, customer, products, subtotal);
  // calculate tax and shipping based off discounted subtotal
  const tax = calculateTax(customer, discounts.discountedSubtotal, taxRates);
  const shipping = calculateShipping(discounts.discountedSubtotal);

  const total = discounts.discountedSubtotal + tax + shipping;

  reserveInventory(products, order);

  return {
    orderId: order.id,
    customer: customer ? customer.name : "UNKNOWN",
    valid: errors.length === 0,
    errors,
    subtotal: Number(subtotal.toFixed(2)),
    discounts,
    tax: Number(tax.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

module.exports = {
  calculateSubtotal,
  calculateTax,
  calculateShipping,
  processOrder
};
