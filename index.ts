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

const exitCommands = ['quit', 'q', 'exit']

const ai_prompts = {
  bash_system: oneLine`you are a savant at bash commands.
you only know bash commands, you don't know anything else.
translate USER's input into a bash command.
if you're not sure how to translate USER's input, say "IDK".
you can only say bash commands or "IDK".`,

  security_system: oneLine`you are a savant at linux security
you only know linux security, you don't know anything else.
USER will input a bash command.
evaluate USER's command for security threats.
report the results of your security check by calling report_security_check.
you can only respond in json format.

FORMAT:
{
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "summary": "a very brief, one sentance, summary of the security check result"
}
`
}

interface SecurityCheck {
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  summary: string
}

async function toBash(input: string) {
  return await next_message([
    { role: 'system', content: ai_prompts.bash_system },
    { role: 'user', content: input }
  ], null, STRONGEST_MODEL, 0)
}

async function securityCheck(input: string) {
  const result = await next_message([
    { role: 'system', content: ai_prompts.security_system },
    { role: 'user', content: input }
  ], null, STRONGEST_MODEL, 0) as string
  return JSON.parse(result) as SecurityCheck
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
    if (line === '') {
      rl.close()
      continue
    } else if (exitCommands.includes(line.toLowerCase())) {
      rl.close()
      process.exit()
    } else {
      const spinner = new Spinner()
      spinner.setSpinnerString(14)
      spinner.start()
      const bash = await toBash(line) as string
      const check = await securityCheck(bash)
      spinner.stop(true)

      if(bash === 'IDK') {
        console.log(chalk.green('Aint that some 💩 try again'))
        rl.close()
        continue
      }

      if(check.severity === 'critical') {
        console.log()
        console.log(chalk.red('⚠️  CRITICAL THREAT ⚠️'))
        console.log(chalk.red(check.summary))
        console.log(chalk.red('⚠️  CRITICAL THREAT ⚠️'))
        console.log()
        rl.close()
        continue
      }

      if(check.severity !== 'none') {
        console.log()
        console.log(chalk.yellow(`THREAT LEVEL: ${check.severity}`))
        console.log(chalk.yellow(check.summary))
        console.log()
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
