<template>
  <div class="whole-page">
    <div class="upper">
      <div class="contents">
        <h1>Get in touch</h1>
        <p>Want to get in touch? We'd love to hear from you</p>
        <p>Here's how you can reach us</p>
      </div>
    </div>
    <div class="lower">
      <div class="section1 container">
        <div><img src="/assets/callingimg.svg" alt="calling-icon"></div>
        <h2>Talk to Sales</h2>
        <div class="p-container">
          <p>Interested in HubSpot's software?</p>
          <p>Just pick up the phone to chat with a memeber of our sales team</p>
          <p><a href="tel:+9779808942189">+977 9826724860</a></p>
        </div>
      </div>
      <div class="section2 container">
        <div><img src="/assets/talkmeimg.svg" alt="talk-to-me-icon"></div>
        <h2>Contact Customer Support</h2>
        <div class="p-container">
          <p>Sometimes things don’t go as planned. We get it.</p>
          <p>When in doubt, reach out. We’re here to help.</p>
          <p>No judgment. No eye rolls. Just solutions.</p>
        </div>
        <button>Contact Support</button>
      </div>

    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.whole-page {
  .upper {
    display: flex;
    align-items: center;
    position: relative;
    height: 48dvh;
    background-size: contain;
    background-position: right;
    background: oklch(92.8% 0.006 264.531);
    background-repeat: no-repeat;
    // z-index: 100;

    &::before {
      content: "";
      background-image: url("/public/assets/goodshi.webp");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: right;
      position: absolute;
      top: 20px;
      width: 100%;
      height: 80%;
      z-index: 1;
    }

    .contents {
      padding: 0 20px;
      position: relative;
      top: -40px;

      h1 {
        font-size: 5rem;
        margin-bottom: 15px;
        font-weight: 500;
      }

      p {
        font-size: 2rem;
        line-height: 1.5;
        font-weight: 300;
      }
    }
  }

  .lower {
    // border: solid 1px green;
    display: flex;
    gap: 20px;
    justify-content: center;
    position: relative;
    top: -75px;

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      position: relative;
      z-index: 2;
      background-color: white;
      width: 530px;
      height: 370px;
      border-radius: 7px;
      box-shadow: rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px;

      img {
        margin: 30px 0px;
        height: 50px;
        width: 50px;
      }

      p {
        text-align: center;
        font-size: 1.5rem;
        // margin: 10px 0;
      }

      h2 {
        font-size: 2rem;
        font-weight: bold;
      }

      .p-container {
        margin: 15px 0;
        display: flex;
        flex-direction: column;
        gap: 15px;

        a {
          text-decoration: underline;

        }
      }
    }

    .section2 {
      button {
        background: red;
        color: white;
        padding: 14px;
        font-size: 2rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: rgb(198, 0, 0)
        }

      }
    }
  }
}
</style>