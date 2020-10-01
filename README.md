# Copybara Action

Google's [Copybara](https://github.com/google/copybara) is a great tool for transforming and moving code between repositories.

This action comes with sensible defaults to make it **very easy** for you to use Copybara with Github but is also **100% customizable** so you can use it with your own config, your own Docker image.

## ♾️ Default flow

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
- One other repo acts as the destination
- SoT branch is always pushed by Copybara to destination branch
- Pull Requests can be created on both SoT and destination
- Pull Requests created on destination are always copied by Copybara to SoT

> This is the flow used for this action's [basic usage](docs/basic-usage.md), you can make it whatever you want it to be in [advanced usage](docs/advanced-usage.md).

## 🔥 [Basic usage](docs/basic-usage.md)

## 🧨 [Advanced usage](docs/advanced-usage.md)

## 🔘 [All options](docs/inputs.md)

## 💚 [Contributing](docs/CONTRIBUTING.md)

## 💬 Support

- For questions about this action: [Join Oliv'r on Keybase](https://keybase.io/team/olivr)
- For questions about Copybara: [Copybara's repo](https://github.com/google/copybara/)
