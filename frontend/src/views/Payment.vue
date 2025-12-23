<template>
  <div class="flex gap-16 p-5 bg-slate-950 min-h-[calc(100vh-80px)]">
    <div class="flex-[3]">
      <!-- Customer Information Form -->
      <div class="mb-8">
        <h1 class="text-2xl mb-5 font-medium text-slate-100">Customer Details</h1>
        <div class="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
             <label class="text-slate-400 text-sm font-medium">Full Name</label>
             <input type="text" v-model="customerDetails.fullName" placeholder="John Doe" class="bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors">
          </div>
          <div class="flex flex-col gap-2">
             <label class="text-slate-400 text-sm font-medium">Phone Number</label>
             <input type="tel" v-model="customerDetails.phone" placeholder="98XXXXXXXX" class="bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors">
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
             <label class="text-slate-400 text-sm font-medium">Delivery Address</label>
             <input type="text" v-model="customerDetails.address" placeholder="Street, City, District" class="bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors">
          </div>
        </div>
      </div>

      <h1 class="text-2xl mb-5 font-medium text-slate-100">Select Payment Method</h1>
      <div class="flex gap-5 mb-5">
        <!-- Cash Option -->
        <div 
            @click="selectedPayment = 'cash'"
            :class="[
                'flex-1 border rounded-xl p-8 flex flex-col items-center transition-all duration-300 bg-slate-900 cursor-pointer group',
                selectedPayment === 'cash' ? 'border-blue-500 shadow-lg shadow-blue-900/10' : 'border-slate-700 hover:border-slate-600'
            ]"
        >
          <img src="/assets/cash.png" alt="money" class="w-20 h-20 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
          <p :class="['text-lg font-semibold transition-colors', selectedPayment === 'cash' ? 'text-blue-400' : 'text-slate-200']">Cash on delivery</p>
        </div>

        <!-- Esewa Option -->
        <div 
            @click="selectedPayment = 'esewa'"
            :class="[
                'flex-1 border rounded-xl p-8 flex flex-col items-center transition-all duration-300 bg-slate-900 cursor-pointer group',
                selectedPayment === 'esewa' ? 'border-[#41A124] shadow-lg shadow-green-900/10' : 'border-slate-700 hover:border-slate-600'
            ]"
        >
          <!-- Esewa Logo Placeholder -->
          <div class="w-20 h-20 mb-6 flex items-center justify-center bg-[#41A124]/10 rounded-full group-hover:scale-110 transition-transform duration-300 border border-[#41A124]/30">
             <span class="text-[#41A124] font-bold text-xl tracking-wider">eSewa</span>
          </div>
          <p :class="['text-lg font-semibold transition-colors', selectedPayment === 'esewa' ? 'text-[#41A124]' : 'text-slate-200']">Esewa Mobile Wallet</p>
        </div>
      </div>

      <div class="bg-slate-900 rounded-xl p-10 border border-slate-800 shadow-sm">
        <ul class="list-none pl-0 m-0 mb-8">
            <li v-if="selectedPayment === 'cash'" class="text-base text-slate-400 pl-8 relative mb-5 before:content-['•'] before:text-blue-500 before:absolute before:left-0">
                You may pay in cash to our courier upon receiving your parcel at the doorstep.
            </li>
            <li v-else class="text-base text-slate-400 pl-8 relative mb-5 before:content-['•'] before:text-[#41A124] before:absolute before:left-0">
                You will be redirected to the eSewa portal to complete your secure payment.
            </li>
        </ul>

        <button 
            @click="handlePayment" 
            :class="[
                'border-none py-3.5 px-6 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-md w-full sm:w-auto',
                selectedPayment === 'esewa' 
                    ? 'bg-[#41A124] text-white hover:bg-[#368a1e] hover:shadow-green-500/30 shadow-green-900/20' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30 shadow-blue-900/20'
            ]"
        >
            {{ selectedPayment === 'esewa' ? 'Pay with eSewa' : 'Confirm Order' }}
        </button>
      </div>
    </div>

    <!-- ORDER SUMMARY -->
    <div class="flex-1 mt-10">
      <div class="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-sm sticky top-24">
        <h3 class="text-lg font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Order Summary</h3>
        <div class="flex justify-between mb-4 text-base text-slate-400 font-medium">
          <p>Subtotal ({{ cartStore.total_buying_item }})</p>
          <span class="text-slate-200">Rs. {{ cartStore.subTotal }}</span>
        </div>

        <div class="flex justify-between mb-4 text-base text-slate-400 font-medium">
          <p>Shipping Fee</p>
          <span class="text-slate-200">Rs. {{ cartStore.shippingCost }}</span>
        </div>

        <div class="flex justify-between mb-6 text-base pt-4 border-t border-slate-800 mt-4 text-slate-100 font-bold">
          <p>Total:</p>
          <span class="text-blue-500 text-xl">Rs. {{ cartStore.totalCost }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/store/cartStore';
import { useToast } from 'vue-toastification';
import { initiateEsewaPayment } from '@/services/esewaService';

const cartStore = useCartStore();
const toast = useToast();
const selectedPayment = ref('cash');

const customerDetails = ref({
    fullName: '',
    address: '',
    phone: ''
});

// link totalAmount to store (for Khalti/eSewa if needed)
const totalAmount = cartStore.totalCost;

const validateForm = () => {
    if (!customerDetails.value.fullName || !customerDetails.value.address || !customerDetails.value.phone) {
        toast.warning("Please fill in all customer details (Name, Address, Phone).");
        return false;
    }
    return true;
};

const handlePayment = () => {
    if (!validateForm()) return;

    if (selectedPayment.value === 'esewa') {
        handleEsewa();
    } else {
        processOrder();
    }
};

const processOrder = async (isEsewa = false) => {
    try {
        const orderItems = cartStore.item_details
            .filter(item => item.checked)
            .map(item => ({
                id: item.id,
                quantity: item.quantity
            }));

        if (orderItems.length === 0) {
            toast.warning("Please select items in your cart first.");
            return false;
        }

        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: orderItems,
                customerInfo: customerDetails.value
            })
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message || "Order Failed");
            return false;
        }

        if (!isEsewa) {
            toast.success("Thank you! Order placed successfully.", {
                toastClassName: "relative top-[50px] bg-white text-black font-medium rounded shadow-lg",
                timeout: 2000,
                hideProgressBar: true,
            });

            // Clear Cart
            cartStore.item_details = [];
            cartStore.totalQuantity();
            cartStore.costCalculation();

            setTimeout(() => {
                window.location.href = '/'; 
            }, 2000);
        }

        return true;

    } catch (err) {
        console.error(err);
        toast.error("Network Error. Please try again.");
        return false;
    }
};

const handleEsewa = () => {
    const orderItems = cartStore.item_details
        .filter(item => item.checked)
        .map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

    if (orderItems.length === 0) {
        toast.warning("Please select items in your cart first.");
        return;
    }

    // Save for deduction on success page
    localStorage.setItem('pending_order', JSON.stringify({
        items: orderItems,
        customerInfo: customerDetails.value
    }));
    
    // Find a representative product ID or use 'multi_order'
    const productId = orderItems[0].id;
    initiateEsewaPayment(totalAmount, String(productId));
};
</script>



