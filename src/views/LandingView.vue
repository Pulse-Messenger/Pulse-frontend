<script setup lang="ts"></script>

<template>
  <main>
    <h1 class="title">
      Welcome to<br />
      <span class="pulse-gradient">Pulse Messenger</span>
    </h1>
    <RouterLink :to="{ name: 'Main' }" class="to-app">Open App</RouterLink>
    <div class="cards">
      <card>
        <div>
          <h2>The fun messaging solution</h2>
          <ul>
            <li>simple</li>
            <li>secure(enough)</li>
            <li>open</li>
            <li>free</li>
          </ul>
        </div>
      </card>
      <div class="review">
        <h2>Our users are satisfied with the product</h2>
        <img src="/matic.png" alt="plan" />
        <q>
          It doesn't matter who we are, what matters is that Pulse is a great
          chat app
        </q>
        <br />
        <p>-Matic Babnik</p>
      </div>
    </div>
  </main>
  <footer>
    <div>
      <img width="100" src="/Logo.webp" />
      <div>
        <h3>Pulse Messenger</h3>
        <h5>by <a href="https://studen.me">David Studen</a></h5>
        <a href="https://github.com/Pulse-Messenger">Source</a>
      </div>
    </div>
    <RouterLink :to="{ name: 'Main' }" class="button-small"
      >Open App</RouterLink
    >
  </footer>
</template>

<style scoped lang="less">
@import "@/assets/main.less";

& * {
  user-select: text !important;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;

  .title {
    font-size: clamp(@font-s-huge, 8vw, 3rem);
    text-align: center;
    margin-top: 20vmin;
    margin-bottom: 2rem;
    font-weight: @font-w-bold;

    .pulse-gradient {
      // make text a gradient
      background: linear-gradient(45deg, @accent, @accent-s) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      font-family: Secular One;
    }
  }

  .to-app {
    border-radius: @border-r-small;
    outline: none;
    border: none;
    padding: 0.5em 1em;
    font-size: clamp(@font-s-small, 3.5vw, 0.6rem);
    background: @accent;
    cursor: pointer;
    transition: @transition-all-fast;

    &:hover {
      filter: brightness(1.25);
    }
  }

  .cards {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 10vmin;

    card {
      width: 100%;
      max-width: 500px;
      margin-bottom: 2rem;

      h2 {
        font-size: clamp(0.9rem, 5vw, 1.25rem);
        color: @accent;
        font-weight: @font-w-bold;
        padding-bottom: 0.5rem;
      }

      li {
        margin-left: 1rem;
        font-size: clamp(@font-s-big, 5vw, 0.9rem);
      }

      li::marker {
        color: @accent-s;
      }
    }

    .review {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 8vmin;

      img {
        width: 100%;
        max-width: 128px;
        max-height: 128px;
        margin-bottom: 1rem;
        border-radius: @border-r-circle;
        object-fit: cover;
      }

      q {
        font-size: @font-s-xxlarge;
        font-style: italic;
        text-align: center;
      }

      h2 {
        font-size: clamp(0.9rem, 5vw, 1.25rem);
        padding-bottom: 1rem;
      }

      p {
        font-size: @font-s-xlarge;
        font-style: italic;
        text-align: center;
      }
    }
  }
}

footer {
  padding: 0.5rem 1rem;
  background: @background-light;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  justify-content: space-around;

  img {
    width: 3rem;
  }

  h3 {
    font-size: clamp(@font-s-xxlarge, 3vw, @font-s-base);
    font-weight: @font-w-bold;
  }

  h5 {
    font-size: clamp(@font-s-small, 3vw, @font-s-medium);
    margin-bottom: 0.5rem;
  }

  a {
    font-size: clamp(@font-s-small, 3vw, @font-s-medium);
  }
}
</style>
