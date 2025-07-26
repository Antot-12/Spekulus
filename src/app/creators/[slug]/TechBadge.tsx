"use client";

type TechBadgeProps = { skill: string };

export const TechBadge = ({ skill }: TechBadgeProps) => {
  const slugMap: Record<string, string> = {
    javascript: 'javascript', js: 'javascript',
    typescript: 'typescript', ts: 'typescript',
    python: 'python', py: 'python',
    java: 'openjdk', kotlin: 'kotlin',
    'c#': 'csharp', csharp: 'csharp',
    'c++': 'cplusplus', cpp: 'cplusplus', cplusplus: 'cplusplus',
    c: 'c', go: 'go', golang: 'go',
    rust: 'rust', php: 'php', ruby: 'ruby',
    swift: 'swift', dart: 'dart', scala: 'scala',
    r: 'rproject', haskell: 'haskell', elixir: 'elixir',
    lua: 'lua', matlab: 'matlab',
    pascal: 'pascal', 'object pascal': 'pascal',
    sql: 'postgresql', postgres: 'postgresql', postgresql: 'postgresql',
    mysql: 'mysql', mariadb: 'mariadb',
    html: 'html5', html5: 'html5',
    css: 'css3', css3: 'css3', sass: 'sass', scss: 'sass',
    less: 'less', stylus: 'stylus',
    tailwind: 'tailwindcss', bootstrap: 'bootstrap', materialui: 'materialui',
    bash: 'gnubash', shell: 'gnubash',
    linux: 'linux', ubuntu: 'ubuntu', windows: 'windows',
    macos: 'macos', android: 'android', ios: 'apple',
    react: 'react', 'react native': 'react',
    next: 'nextdotjs', 'next.js': 'nextdotjs', nextjs: 'nextdotjs',
    vue: 'vuedotjs', angular: 'angular', svelte: 'svelte',
    express: 'express', fastapi: 'fastapi',
    django: 'django', flask: 'flask',
    laravel: 'laravel', symfony: 'symfony',
    rails: 'rubyonrails', spring: 'springboot',
    dotnet: 'dotnet', aspnet: 'dotnet',
    graphql: 'graphql', prisma: 'prisma',
    docker: 'docker', kubernetes: 'kubernetes',
    git: 'git', github: 'github', gitlab: 'gitlab',
    bitbucket: 'bitbucket', jenkins: 'jenkins',
    terraform: 'terraform', ansible: 'ansible',
    aws: 'amazonaws', azure: 'microsoftazure',
    'azure devops': 'microsoftazure',
    gcp: 'googlecloud', firebase: 'firebase',
    heroku: 'heroku', netlify: 'netlify', vercel: 'vercel',
    vscode: 'visualstudiocode', 'visual studio code': 'visualstudiocode',
    'visual studio': 'visualstudio',
    intellij: 'intellijidea', pycharm: 'pycharm',
    phpstorm: 'phpstorm', clion: 'clion',
    eclipse: 'eclipseide', atom: 'atom',
    sublime: 'sublimetext', jetbrains: 'jetbrains',
    figma: 'figma', sketch: 'sketch',
    adobe: 'adobecreativecloud', photoshop: 'adobephotoshop',
    illustrator: 'adobeillustrator', xd: 'adobexd',
    postman: 'postman', swagger: 'swagger', 'rest api': 'swagger',
    notion: 'notion', jira: 'jira', trello: 'trello', slack: 'slack',
    unity: 'unity', 'unreal engine': 'unrealengine',
    tensorflow: 'tensorflow', pytorch: 'pytorch',
    keras: 'keras', numpy: 'numpy', pandas: 'pandas',
    scikitlearn: 'scikitlearn',
    'system architecture': 'diagramsdotnet',
    'system design': 'diagramsdotnet',
    'embedded systems': 'raspberrypi',
    'hardware integration': 'raspberrypi'
  };

  const altSrc: Record<string, string[]> = {
    pascal: [
      'https://worldvectorlogo.com/logos/pascal.svg',
      'https://cdn-icons-png.flaticon.com/512/5968/5968350.png'
    ],
    azure: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg'
    ],
    'azure devops': [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg'
    ],
    node: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
    ],
    nodejs: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
    ],
    'node.js': [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
    ],
    css: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
    ],
    csharp: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg'
    ],
    'c#': [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg'
    ],
    windows: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg'
    ],
    'visual studio': [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg'
    ],
    adobe: [
      'https://cdn.worldvectorlogo.com/logos/adobe-2.svg'
    ],
    adobecreativecloud: [
      'https://cdn.worldvectorlogo.com/logos/adobe-2.svg'
    ],
    swagger: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg'
    ],
    fastapi: [
      'https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png'
    ],
    haskell: [
      'https://upload.wikimedia.org/wikipedia/commons/1/1c/Haskell-Logo.svg'
    ],
    matlab: [
      'https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png'
    ]
  };

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.\-]/g, '');

  const key = normalize(skill);
  const slug = slugMap[key] || key.replace(/\s+/g, '').replace(/\./g, 'dot');

  const urls: string[] = [`https://cdn.simpleicons.org/${slug}`];
  if (altSrc[key]) urls.push(...altSrc[key]);
  urls.push('https://cdn.simpleicons.org/code/00F0FF');

  let i = 0;
  const err = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    i++;
    if (i < urls.length) {
      (e.target as HTMLImageElement).src = urls[i];
    } else {
      (e.target as HTMLImageElement).onerror = null;
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
      <img src={urls[0]} alt={`${skill} logo`} className="h-5 w-5" onError={err} />
      <span className="truncate">{skill}</span>
    </div>
  );
};
