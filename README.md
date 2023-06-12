![murderteeth_pixel_art_of_a_cute_cybernetic_virus_anime_aestheti_b8a3e1cf-6a71-4d7f-be09-92069c8d8bfa-removebg-preview](https://github.com/murderteeth/rash/assets/89237203/27ac0260-c90d-4f5c-ae97-27ff5ec39976)

# rash
A simple cli tool that translates natural language into bash commands. Rash uses OpenAI GPT-4, bring your own API key.

## usage
One-shot mode
```bash
rash <natural language description of what you want to do>
```

Interactive mode
```bash
rash
```

## configure
First, configure an environment variable called `OPENAI_API_KEY` and set it to your openai api key. If you need a key, go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).

## install
```bash
npm install -g rash-cli
```

## uninstall
```bash
npm uninstall -g rash-cli
```

## dev setup
```bash
cp .env.example .env
# configure .env
yarn
yarn build
```

## dev test
```bash
yarn console
```
