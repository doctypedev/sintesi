/**
 * Init Command - Interactive setup for Doctype configuration
 *
 * Creates a doctype.config.json file with user-provided settings:
 * - Project name
 * - Project root directory
 * - Documentation folder
 * - Map file name
 */

import * as fs from 'fs';
import * as path from 'path';
import * as p from '@clack/prompts';
import { InitOptions, InitResult, DoctypeConfig } from './types';

/**
 * Add a line to .gitignore if not already present
 */
function addToGitignore(line: string): void {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContent = '';

  // Read existing .gitignore if it exists
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  }

  // Check if line already exists
  if (gitignoreContent.split('\n').includes(line)) {
    return; // Already present
  }

  // Add the line
  if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
    gitignoreContent += '\n';
  }
  gitignoreContent += `${line}\n`;

  // Write back
  fs.writeFileSync(gitignorePath, gitignoreContent, 'utf-8');
}

/**
 * Execute the init command
 */
export async function initCommand(
  _options: InitOptions = {}
): Promise<InitResult> {
  try {
    // Display intro
    p.intro('🚀 DOCTYPE INITIALIZATION');

    // Check if config already exists
    const configPath = path.join(process.cwd(), 'doctype.config.json');
    if (fs.existsSync(configPath)) {
      const overwrite = await p.confirm({
        message: '⚠️  doctype.config.json already exists. Do you want to overwrite it?',
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Initialization cancelled.');
        return {
          success: false,
          error: 'Configuration file already exists',
        };
      }
    }

    // Prompt 1: Project name
    const projectName = await p.text({
      message: 'What is your project name?',
      placeholder: path.basename(process.cwd()),
      defaultValue: path.basename(process.cwd()),
    });

    if (p.isCancel(projectName)) {
      p.cancel('Initialization cancelled.');
      return { success: false, error: 'Cancelled by user' };
    }

    // Prompt 2: Project root
    const projectRoot = await p.text({
      message: 'Where is your project root directory?',
      placeholder: '.',
      defaultValue: '.',
    });

    if (p.isCancel(projectRoot)) {
      p.cancel('Initialization cancelled.');
      return { success: false, error: 'Cancelled by user' };
    }

    // Prompt 3: Documentation folder
    const docsFolder = await p.text({
      message: 'Where do you want to store documentation?',
      placeholder: './docs',
      defaultValue: './docs',
    });

    if (p.isCancel(docsFolder)) {
      p.cancel('Initialization cancelled.');
      return { success: false, error: 'Cancelled by user' };
    }

    // Prompt 4: Map file name
    const mapFile = await p.text({
      message: 'What should the map file be called?',
      placeholder: 'doctype-map.json',
      defaultValue: 'doctype-map.json',
    });

    if (p.isCancel(mapFile)) {
      p.cancel('Initialization cancelled.');
      return { success: false, error: 'Cancelled by user' };
    }

    // Prompt 5: OpenAI API Key
    const envPath = path.join(process.cwd(), '.env');
    let existingApiKey: string | null = null;

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/OPENAI_API_KEY=(.+)/);
      if (match) {
        existingApiKey = match[1].trim();
      }
    }

    let apiKey = '';

    if (existingApiKey) {
      p.note(
        `Existing key: ${existingApiKey.substring(0, 10)}...`,
        '🔑 API Key detected'
      );

      const replaceKey = await p.confirm({
        message: 'Do you want to replace the existing API key?',
        initialValue: false,
      });

      if (p.isCancel(replaceKey)) {
        p.cancel('Initialization cancelled.');
        return { success: false, error: 'Cancelled by user' };
      }

      if (replaceKey) {
        const newApiKey = await p.password({
          message: 'Enter your new OpenAI API key:',
        });

        if (p.isCancel(newApiKey)) {
          p.cancel('Initialization cancelled.');
          return { success: false, error: 'Cancelled by user' };
        }

        apiKey = newApiKey as string;
      } else {
        apiKey = existingApiKey;
      }
    } else {
      p.note(
        'Your API key will be saved securely in a local .env file',
        '🔑 OpenAI API Key'
      );

      const newApiKey = await p.password({
        message: 'Enter your OpenAI API key (optional, press Enter to skip):',
      });

      if (p.isCancel(newApiKey)) {
        p.cancel('Initialization cancelled.');
        return { success: false, error: 'Cancelled by user' };
      }

      apiKey = (newApiKey as string) || '';
    }

    // Create configuration object
    const config: DoctypeConfig = {
      projectName: projectName as string,
      projectRoot: projectRoot as string,
      docsFolder: docsFolder as string,
      mapFile: mapFile as string,
    };

    // Create spinner for file operations
    const s = p.spinner();

    // Validate and create project root
    s.start('Validating project structure...');
    const fullProjectRoot = path.resolve(process.cwd(), config.projectRoot);
    if (!fs.existsSync(fullProjectRoot)) {
      fs.mkdirSync(fullProjectRoot, { recursive: true });
      s.message(`Created directory: ${fullProjectRoot}`);
    }

    // Save configuration
    s.message('Saving configuration...');
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2) + '\n',
      'utf-8'
    );

    // Save API key to .env file if provided
    if (apiKey) {
      s.message('Saving API key to .env...');
      let envContent = '';

      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');

        if (envContent.includes('OPENAI_API_KEY=')) {
          envContent = envContent.replace(
            /OPENAI_API_KEY=.*/,
            `OPENAI_API_KEY=${apiKey}`
          );
        } else {
          if (!envContent.endsWith('\n')) {
            envContent += '\n';
          }
          envContent += `OPENAI_API_KEY=${apiKey}\n`;
        }
      } else {
        envContent = `OPENAI_API_KEY=${apiKey}\n`;
      }

      fs.writeFileSync(envPath, envContent, 'utf-8');

      // Add .env to .gitignore for security
      s.message('Protecting .env in .gitignore...');
      addToGitignore('.env');
    }

    s.stop('✅ Configuration complete!');

    // Display summary
    p.note(
      [
        `Project Name: ${config.projectName}`,
        `Project Root: ${config.projectRoot}`,
        `Docs Folder:  ${config.docsFolder}`,
        `Map File:     ${config.mapFile}`,
        apiKey ? `API Key:      ${'*'.repeat(20)}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      '📋 Configuration Summary'
    );

    // Next steps
    p.note(
      [
        '• Create your documentation in the docs folder',
        '• Add doctype anchors to your markdown files',
        '• Run "doctype check" to verify documentation',
      ].join('\n'),
      '🎯 Next Steps'
    );

    p.outro('🎉 Doctype has been successfully initialized!');

    return {
      success: true,
      configPath,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    p.cancel(`Failed to initialize: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
