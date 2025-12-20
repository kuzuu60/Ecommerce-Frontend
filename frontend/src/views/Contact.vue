<template>
  <div class="min-h-[calc(100vh-90px)] bg-slate-950 font-sans">
    <!-- Hero Section -->
    <div class="relative h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-950/80 z-0"></div>
      
      <!-- Content -->
      <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">Get in touch</h1>
        <p class="text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
            Want to get in touch? We'd love to hear from you. <br/> Here's how you can reach us.
        </p>
      </div>

      <!-- Decorative Background Image -->
      <img src="/assets/goodshi.webp" alt="Background" class="absolute right-0 top-0 h-full w-auto opacity-20 object-cover pointer-events-none z-0" />
    </div>

    <!-- Cards Section -->
    <div class="relative z-20 max-w-6xl mx-auto px-6 -mt-20 pb-20">
      <div class="grid md:grid-cols-2 gap-8">
        
        <!-- Sales Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center hover:bg-slate-800 transition-all duration-300 group">
          <div class="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <img src="/assets/callingimg.svg" alt="Phone" class="w-10 h-10 brightness-0 invert opacity-80" />
          </div>
          
          <h2 class="text-3xl font-bold text-white mb-4">Talk to Sales</h2>
          
          <div class="space-y-3 text-slate-400 text-lg">
            <p>Interested in our products?</p>
            <p>Just pick up the phone to chat with a member of our sales team.</p>
            <p class="pt-4">
              <a href="tel:+9779808942189" class="text-2xl font-bold text-blue-500 hover:text-blue-400 transition-colors">
                +977 9826724860
              </a>
            </p>
          </div>
        </div>

        <!-- Support Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center hover:bg-slate-800 transition-all duration-300 group">
          <div class="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
             <img src="/assets/talkmeimg.svg" alt="Chat" class="w-10 h-10 brightness-0 invert opacity-80" />
          </div>

          <h2 class="text-3xl font-bold text-white mb-4">Contact Support</h2>

          <div class="space-y-3 text-slate-400 text-lg">
            <p>Sometimes things don’t go as planned.</p>
            <p>When in doubt, reach out. We’re here to help.</p>
            <p>No judgment. No eye rolls. Just solutions.</p>
          </div>

          <button class="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/20 active:translate-y-0.5 transition-all w-full max-w-xs">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
</script>