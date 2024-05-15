#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { input, confirm } from '@inquirer/prompts'
import { oneLine } from 'common-tags'
import { STRONGEST_MODEL, next_message } from './ai'
import chalk from 'chalk'
import { exec } from 'child_process'
import * as util from 'util'

const execPromise = util.promisify(exec)

const ai_prompts = {
  bash_system: oneLine`you are a savant at bash commands.
you only know bash commands, you don't know anything else.
translate USER's input into a bash command.
the bash command will be run directly on the system, never include extra information or markup.
if you're not sure how to translate USER's input, say "IDK".
you can only say bash commands or "IDK".`,

  security_system: oneLine`you are a savant at linux security. 
you only know linux security, you don't know anything else.
USER will input a bash command.
evaluate USER's bash command for security threats.
you respond in raw json format with no extra markup or surrounding annotation.

FORMAT:
{
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "summary": "a very brief, one sentance, summary of the security check result"
}
`,

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

async function main() {
  const ora = await (await import('ora')).default

  const argv = await yargs(hideBin(process.argv)).parse()
  let user_prompt = ''

  if (!argv._.length) {
    user_prompt = await input({ message: 'Howdy, how can I help? (ctrl-c to quit)' })
  } else {
    user_prompt = argv._.join(' ')
  }

  console.log()
  const bashSpinner = ora(`"${user_prompt}"`)
  bashSpinner.start()
  const bash = await toBash(user_prompt) as string
  const check = await securityCheck(bash)

  if (check.severity === 'critical') {
    bashSpinner.fail(`"${user_prompt}"`)
    bashSpinner.stop()

    console.log()
    console.log(chalk.red('⚠️  CRITICAL THREAT ⚠️'))
    console.log(chalk.red(check.summary))
    console.log(chalk.red('⚠️  CRITICAL THREAT ⚠️'))
    console.log()
    process.exit()
  }

  bashSpinner.succeed(`"${user_prompt}"`)
  bashSpinner.stop()

  if (check.severity !== 'none') {
    console.log()
    console.log(chalk.yellow(`THREAT LEVEL: ${check.severity}`))
    console.log(chalk.yellow(check.summary))
    console.log()
  }

  console.log()
  console.log(chalk.black.bgCyan(bash))
  console.log()

  const runSpinner = ora(`"${user_prompt}"`)
  const confirmed = await confirm({ message: 'Run this command?', default: check.severity === 'none' });
  if (confirmed) {
    runSpinner.start()
    runSpinner.stop()

    const { stdout } = await execPromise(`${bash}`)
    console.log(stdout)

  } else {
    runSpinner.fail(`"${bash}"`)
  }

  console.log()
}

main().catch((error) => {
  console.error('Error in main():', error)
  process.exit(1)
})

