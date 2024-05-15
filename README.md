![murderteeth_pixel_art_of_a_cute_cybernetic_virus_anime_aestheti_b8a3e1cf-6a71-4d7f-be09-92069c8d8bfa-removebg-preview](https://github.com/murderteeth/rash/assets/89237203/a1955cad-1213-4570-9bee-69db58afdb82)

# rash
A cli tool that translates natural language into bash commands. Rash uses OpenAI GPT-4o, bring your own API key.

## usage
```bash
rash <natural language description of what you want to do>
```

https://github.com/murderteeth/rash/assets/89237203/e1e714f4-890f-4550-855f-39c27f017118


## natural language command examples
- `stop all docker containers`
- `kill the process running on port 3000`
- `find files at path ./ containing the text 'xyz'`


## configure
Configure an environment variable called `OPENAI_API_KEY` and set it to your openai api key. If you need a key, go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).

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
bun install
bun build
```

## dev test
```bash
bun run console
```
or just
```bash
bun run index.ts
```
