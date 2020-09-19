# Copybara Action

Google's [Copybara](https://github.com/google/copybara) is a great tool for transforming and moving code between repositories.

This action comes with sensible defaults to make it **very easy** for you to use Copybara with Github but is also **100% customizable** so you can use it with your own config, your own Docker image.

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [💾 Installation](#-installation)
- [🔥 Usage](#-usage)
- [💚 Contributing](#-contributing)
  - [Top five ways to contribute](#top-five-ways-to-contribute)
- [💡 Todo](#-todo)
- [💬 Support](#-support)
- [📜 License](#-license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## 🔁 Default flow

```text
 Source of Truth                  Destination

+---------------+   Copybara   +---------------+
|     Branch    +------------> |     Branch    |
+-------+-------+              +---------------+
        ^
        |
        |
+-------+-------+   Copybara   +---------------+
| Pull Requests | <------------+ Pull Requests |
+---------------+              +---------------+
```

- One repo acts as the Source of Truth (SoT)
- One other repo acts as the destination repo
- SoT branch is always pushed by Copybara to destination branch
- Pull Requests can be created on both SoT and destination
- Pull Requests created on destination are always copied by Copybara to SoT

> This is the default generated flow, you can customize it

## 🔥 [Basic usage](basic-usage.md)

## 🧨 [Advanced usage](advanced-usage.md)

## 🔘 [Options](options.md)

## 💚 Contributing

<!-- project-contributing -->

### [Developer documentation](development.md)

### Five other ways to contribute

⭐ Star this repo: it's quick and goes a long way! [🔝](#top)

🗣️ [Spread the word](CONTRIBUTING.md#spread-the-word)

🐞 [Report bugs](CONTRIBUTING.md#report-bugs)

✅ [Resolve issues](CONTRIBUTING.md#resolve-issues)

📝 [Improve the documentation](CONTRIBUTING.md#improve-the-documentation)

<!-- project-contributing -->

Please see [CONTRIBUTING.md](CONTRIBUTING.md) in the docs folder for more information.

## 💡 Todo

<!-- project-todo -->

- [ ] Update documentation
- [ ] Add more transformations in the basic usage

<!-- project-todo -->

## 💬 Support

<!-- project-support -->

[Discuss on Keybase](https://keybase.io/team/olivr)

<!-- project-support -->

## 📜 License

<!-- project-license -->

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

<!-- project-license -->

## 🙏 Acknowledgements

Thanks to the developers behind [Copybara](https://github.com/google/copybara). This action would not exist without this excellent tool.
