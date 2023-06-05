#!/usr/bin/env node

import 'dotenv/config'
import * as readline from 'readline'
import { STRONGEST_MODEL, next_message } from './ai'
import { oneLine } from 'common-tags'
import { Spinner } from 'cli-spinner'
import { exec } from 'child_process'
import * as util from 'util'
import chalk from 'chalk'
import prompts from 'prompts'

const execPromise = util.promisify(exec)

const bash_prompt = {
  system: oneLine`you are a savant at bash commands.
you only know bash commands, you don't know anything else.
translate USER's input into a bash command.
if you're not sure how to translate USER's input, say "IDK".
you can only say bash commands or "IDK".`
}

async function toBash(input: string) {
  return await next_message([
    { role: 'system', content: bash_prompt.system },
    { role: 'user', content: input }
  ], STRONGEST_MODEL, 0)
}

(async () => {
  const commandline = process.argv.slice(2).join(' ')

  while(true) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    if(commandline) {
      console.log(chalk.green(`rash> ${commandline}`))
    } else {
      rl.setPrompt('rash> ')
      rl.prompt()
    }

    const line = commandline || await new Promise<string>(resolve => rl.once('line', resolve))
    if (line === 'quit' || line === 'q') {
      rl.close()
      process.exit()
    } else {
      const spinner = new Spinner()
      spinner.setSpinnerString(14)
      spinner.start()
      const bash = await toBash(line)
      spinner.stop(true)

      if(bash === 'IDK') {
        console.log(chalk.green('Aint that some 💩 try again'))
        rl.close()
        continue
      }

      const { confirmed } = await prompts({
        type: 'toggle',
        name: 'confirmed',
        message: bash,
        initial: false,
        active: 'Yes',
        inactive: 'No'
      }, {
        onCancel: () => {
          rl.close()
          process.exit()
        }
      })

      rl.close()

      if(confirmed) {
        const { stdout, stderr } = await execPromise(bash)
        console.log()
        console.log(chalk.black.bgCyan(bash))
        console.log()
        console.log(stdout)
        console.log()
        if(stderr) {
          console.log()
          console.error(chalk.red(stderr))
          console.log()
        }
      }

      if(commandline) process.exit()
    }
  }
})()
