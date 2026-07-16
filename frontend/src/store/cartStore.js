import { defineStore } from "pinia";
import { ref } from "vue";

export const FREE_SHIPPING_THRESHOLD = 5000;
const DEFAULT_SHIPPING_FEE = 100;

export const useCartStore = defineStore("cart", () => {
  // Reactive State
  const item_details = ref(JSON.parse(localStorage.getItem('luxe_cart_items')) || []); 
  const totalItem = ref(0); 
  const shippingCost = ref(0); 
  const subTotal = ref(0); 
  const totalCost = ref(0); 
  const total_buying_item = ref(0); 
  const discountAmount = ref(0);
  const promoButton=ref(false); 
  const isCartOpen = ref(false); // State to control cart sidebar visibility

  // Watch for changes and save to local storage
  const saveCart = () => {
    localStorage.setItem('luxe_cart_items', JSON.stringify(item_details.value));
  };

  // Function: Add item to cart
  const addToCart = (quantity, id, title, image, price) => {
    const itemIndex = item_details.value.findIndex(
      (item) => item?.id === Number(id)
    );

    if (itemIndex !== -1) {
      // If item already exists, increase quantity and ensure it's checked
      item_details.value[itemIndex].quantity += quantity;
      item_details.value[itemIndex].checked = true;
    } else {
      // Add new item to the cart, automatically checked
      item_details.value.unshift({
        id: Number(id),
        quantity,
        title,
        image,
        checked: true, // Auto-tick newly added item
        price,
        shipping_fee: 100, // Fixed shipping fee per item
      });
    }
    
    // Auto-open cart sidebar and calculate costs
    isCartOpen.value = true;
    saveCart();
    costCalculation();
    totalQuantity();
  };

  // Function: Calculate costs (subtotal, shipping, total)
  const costCalculation = () => {
    const checkedItems = item_details.value.filter((item) => item.checked);

    // Calculate subtotal for checked items before shipping or discounts.
    subTotal.value = checkedItems
      .map((item) => ({ quantity: item.quantity, price: item.price }))
      .reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Orders at or above the threshold receive free shipping.
    const standardShipping = checkedItems
      .reduce((sum, item) => sum + Number(item.shipping_fee ?? DEFAULT_SHIPPING_FEE), 0);
    shippingCost.value = subTotal.value >= FREE_SHIPPING_THRESHOLD ? 0 : standardShipping;

    total_buying_item.value = checkedItems
      .reduce((sum, item) => sum + item.quantity, 0);

    subTotal.value = Number(subTotal.value.toFixed(2)); // Ensure it's still a number
    totalCost.value = Number((subTotal.value + shippingCost.value).toFixed(2)); // Ensure it's still a number
  };

  // Function: Calculate total quantity of all items (checked or not)
  const totalQuantity = () => {
    totalItem.value = item_details.value
      .map((item) => item.quantity)
      .reduce((a, b) => a + b, 0);
  };

  // Function: Update item quantity
  const updateQuantity = (id, quantity) => {
    const itemIndex = item_details.value.findIndex((item) => item.id === id);
    item_details.value[itemIndex].quantity = quantity;
    saveCart();
    costCalculation();
  };

  // Function: Toggle checked status of an item
  const updateChecked = (id) => {
    const itemIndex = item_details.value.findIndex((item) => item.id === id);
    item_details.value[itemIndex].checked =
      !item_details.value[itemIndex].checked;
    saveCart();
    costCalculation();
    promoButton.value = false; // Reset promo button when checked status changes
  };

  // Function: Remove item from cart
  const removeItem = (id) => {
    const itemIndex = item_details.value.findIndex((item) => item.id === id);
    item_details.value.splice(itemIndex, 1);
    saveCart();
    costCalculation();
  };

  const promoDiscountCalculation = (discount) => {
    // 1. Try to extract text + number from the code
    const match = discount.match(/^([A-Za-z]+)([1-9][0-9]?)$/);

    if (!match) {
      console.log("invalid discount code");
    } else {
      promoButton.value = true; // Set promo button to true
      // 2. Get the number part like 20 from SAVE20
      const discountPercent = parseInt(match[2], 10);

      // 3. Total before discount
      const totalBeforeDiscount = subTotal.value + shippingCost.value;

      // 4. How much money we are saving
      discountAmount.value = Number(
        (totalBeforeDiscount * (discountPercent / 100)).toFixed(2)
      );

      // 5. Final total after subtracting discount
      totalCost.value = Number(
        (totalBeforeDiscount - discountAmount.value).toFixed(2)
      );
    }
  };

  // Return store values
  return {
    shippingCost,
    subTotal,
    totalCost,
    totalItem,
    item_details,
    total_buying_item,
    discountAmount,
    promoButton,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    totalQuantity,
    costCalculation,
    updateChecked,
    promoDiscountCalculation,
  };
});



// export const useCartsStore = defineStore("carts", {
//   state:()=>({
//     item_details:[],
//     totalItem: 0,
//     shippingCost:0,
//     subTotal:0,
//     total_buying_item:0,
//     discountAmount:0,
//     promoButton:false
//   }),
//   // getters:{
//   //   total_prodict_details:(state)=> state.item_details 
//   // },
//   actions:{
//      addToCart(quantity, id, title, image, price){
//       const itemIndex = this.item_details.findIndex(
//         (item) => item?.id === Number(id)
//       );
  
//       if (itemIndex !== -1) {
//         // If item already exists, increase quantity
//         this.item_details[itemIndex].quantity += quantity;
//       } else {
//         // Add new item to the cart
//         this.item_details.push({
//           id: Number(id),
//           quantity,
//           title,
//           image,
//           checked: false, // Default unchecked
//           price,
//           shipping_fee: 100, // Fixed shipping fee per item
//         });
//       }
//     },
    
//     costCalculation(){
//       // Calculate total shipping cost for checked items
//       this.shippingCost = this.item_details
//         .map((item) => (item.checked ? item.shipping_fee : 0))
//         .reduce((a, b) => a + b, 0);
  
//       // Calculate subtotal for checked items
//       this.subTotal = this.item_details
//         .map((item) => ({
//           quantity: item.checked ? item.quantity : 0,
//           price: item.checked ? item.price : 0,
//         }))
//         .reduce((sum, item) => sum + item.quantity * item.price, 0);
  
//       // Calculate total quantity of checked items
//       this.total_buying_item = this.item_details
//         .map((item) => (item.checked ? item.quantity : 0))
//         .reduce((a, b) => a + b, 0);
  
//       this.subTotal = Number(this.subTotal.toFixed(2)); // Ensure it's still a number
//       this.totalCost = Number((this.subTotal + this.shippingCost).toFixed(2)); // Ensure it's still a number
//     }
//   }
// })
