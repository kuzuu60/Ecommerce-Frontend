<template>
  <div class="test">
    <div class="hero-content">
      <p class="hero-tagline">Your One-Stop Shopping Destination</p>
      <div class="hero-title">
        <h1>Find Everything You Need,</h1>
        <h1> All in One Place!</h1>
      </div>
      <div class="hero-subtitle">
        <p>From the latest fashion trends to must-have gadgets, </p>
        <p>find everything you love—all in one place</p>
      </div>
      <div class="buttons">
        <button>Shop Now</button>
        <button class="secondary-btn">Browse Categories</button>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.test {
  position: relative;
  height: calc(100dvh - 60px);
  background-image: url("/assets/heroine section.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;

  &::before {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .hero-content {
    transform: translate(0px, -48px);
    position: relative;
    z-index: 1;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 15px; 
  }
}

.hero-tagline {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(255, 129, 129);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-title {
  font-size: 5rem;
  font-weight: bold;
  color: white;
  line-height: 60px;
}

.hero-subtitle {
  font-size: 2rem;
  color: white;
  line-height: 30px;
}

.buttons {
  display: flex;
  gap: 15px;
}

.buttons button {
  background: red;
  color: white;
  padding: 14px;
  font-size: 2rem;
  border-radius: 4px;
  cursor: pointer;
}

.buttons button:hover {
  background: rgb(198, 0, 0);
}

.secondary-btn {
  background: transparent;
  color:red;
}

</style>
