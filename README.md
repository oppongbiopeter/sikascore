# SikaScore

Demo of a Ghana credit check. A person creates an account, adds their details, captures or types a Ghana Card, and pays a GH₵20 mobile-money fee. The app then shows a sample file shaped like a pull from the three Bank of Ghana licensed bureaus: XDS Data Ghana, Dun & Bradstreet Credit Bureau, and myCredit Score.

This is not a live bureau. It does not submit a Ghana Card, does not move money, and is not licensed by the Bank of Ghana.

## Demo Ghana Card PINs

| PIN | File |
| --- | --- |
| `GHA-723188461-5` | Ama Serwaa, 687, Good |
| `GHA-110294883-2` | Kwame Boateng, 578, Below average |
| `GHA-880441227-9` | Akosua Mensah, 742, Excellent |

## Run

```bash
npm install
npm run dev
```

The score weights in the app match the published myCreditScore formula only: repayment 60%, dishonoured cheques 15%, judgment debt 10%, socio-economic 7%, economic assets 5%, demographics 3%. XDS and Dun & Bradstreet do not publish those weights. See [docs/ghana-credit-scoring.md](docs/ghana-credit-scoring.md).
