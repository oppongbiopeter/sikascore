import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FEE_GHS,
  WALLETS,
  normalizePin,
  validPin,
  useAccount,
  type Account,
  type Wallet,
} from "@/lib/account/store";
import { formatMoney } from "@/lib/credit/model";
import { DEMO_PINS, profileForPin } from "@/lib/credit/profiles";
import { useCredit } from "@/lib/credit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({ component: JoinPage });

type Step = "welcome" | "login" | "account" | "details" | "card" | "pay" | "pull";

const inputClass =
  "h-11 w-full rounded-xl bg-surface px-3 text-sm text-fg outline-none placeholder:text-subtle";

function JoinPage() {
  const navigate = useNavigate();
  const saved = useAccount((s) => s.account);
  const saveAccount = useAccount((s) => s.saveAccount);
  const patch = useAccount((s) => s.patch);
  const setProfileId = useCredit((s) => s.setProfileId);
  const [step, setStep] = useState<Step>(() => {
    if (saved?.signedIn && saved.cardPin && !saved.paid) return "pay";
    if (saved?.signedIn && saved.paid) return "welcome";
    return "welcome";
  });

  const [fullName, setFullName] = useState(saved?.fullName ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(saved?.dob ?? "");
  const [sex, setSex] = useState<Account["sex"]>(saved?.sex ?? "Female");
  const [digitalAddress, setDigitalAddress] = useState(saved?.digitalAddress ?? "");
  const [city, setCity] = useState(saved?.city ?? "Accra");
  const [occupation, setOccupation] = useState(saved?.occupation ?? "");
  const [method, setMethod] = useState<Account["cardMethod"]>(saved?.cardMethod ?? "photo");
  const [cardPin, setCardPin] = useState(saved?.cardPin ?? "");
  const [cardSurname, setCardSurname] = useState(saved?.cardSurname ?? "");
  const [cardFirstNames, setCardFirstNames] = useState(saved?.cardFirstNames ?? "");
  const [cardDoc, setCardDoc] = useState(saved?.cardDoc ?? "");
  const [cardExpiry, setCardExpiry] = useState(saved?.cardExpiry ?? "");
  const [cardPhoto, setCardPhoto] = useState<string | null>(saved?.cardPhoto ?? null);
  const [wallet, setWallet] = useState<Wallet>("mtn");
  const [error, setError] = useState("");
  const [loginPhone, setLoginPhone] = useState(saved?.phone ?? "");
  const [loginPassword, setLoginPassword] = useState("");

  function draft(extra: Partial<Account> = {}): Account {
    return {
      signedIn: true,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password || saved?.password || "",
      dob,
      sex,
      digitalAddress: digitalAddress.trim(),
      city: city.trim(),
      occupation: occupation.trim(),
      cardMethod: method,
      cardPin: normalizePin(cardPin),
      cardSurname: cardSurname.trim(),
      cardFirstNames: cardFirstNames.trim(),
      cardDoc: cardDoc.trim(),
      cardExpiry,
      cardPhoto,
      paid: saved?.paid ?? false,
      paidVia: saved?.paidVia ?? null,
      paidAt: saved?.paidAt ?? null,
      ...extra,
    };
  }

  return (
    <div className="flex min-h-dvh justify-center bg-bg text-fg">
      <div className="flex h-dvh w-full max-w-md flex-col">
        <main className="flex-1 overflow-y-auto overscroll-contain px-5 pt-8 pb-10">
          <p className="text-sm text-muted">SikaScore</p>
          {step === "welcome" ? (
            <Welcome
              hasAccount={Boolean(saved)}
              onCreate={() => {
                setError("");
                setStep("account");
              }}
              onLogin={() => {
                setError("");
                setStep("login");
              }}
              onReport={() => navigate({ to: "/" })}
              paid={Boolean(saved?.signedIn && saved.paid)}
            />
          ) : null}
          {step === "login" ? (
            <section className="mt-6">
              <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
              <p className="mt-2 text-sm text-muted">This account stays on this device.</p>
              <div className="mt-5 flex flex-col gap-3">
                <input className={inputClass} placeholder="Phone" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} />
                <input className={inputClass} placeholder="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
              {error ? <p className="mt-3 text-sm text-below">{error}</p> : null}
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  if (!saved || saved.phone !== loginPhone.trim() || saved.password !== loginPassword) {
                    setError("Phone or password does not match the account on this device.");
                    return;
                  }
                  patch({ signedIn: true });
                  if (!saved.cardPin) setStep("details");
                  else if (!saved.paid) setStep("pay");
                  else navigate({ to: "/" });
                }}
              >
                Continue
              </Button>
              <button type="button" className="mt-4 min-h-11 text-sm text-muted" onClick={() => setStep("welcome")}>
                Back
              </button>
            </section>
          ) : null}
          {step === "account" ? (
            <section className="mt-6">
              <StepLabel n={1} />
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <div className="mt-5 flex flex-col gap-3">
                <input className={inputClass} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input className={inputClass} placeholder="Phone · 024 000 0000" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className={inputClass} placeholder="Email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inputClass} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="mt-3 text-sm text-below">{error}</p> : null}
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  if (fullName.trim().length < 3 || phone.trim().length < 10 || !email.includes("@") || password.length < 6) {
                    setError("Enter your name, a Ghana phone number, email, and a password of at least 6 characters.");
                    return;
                  }
                  setError("");
                  saveAccount(draft());
                  setStep("details");
                }}
              >
                Next
              </Button>
            </section>
          ) : null}
          {step === "details" ? (
            <section className="mt-6">
              <StepLabel n={2} />
              <h1 className="text-2xl font-semibold tracking-tight">Your details</h1>
              <p className="mt-2 text-sm text-muted">The bureaus match a file to a person, not just a phone number.</p>
              <div className="mt-5 flex flex-col gap-3">
                <input className={inputClass} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  {(["Female", "Male"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSex(option)}
                      className={cn(
                        "h-11 rounded-full text-sm font-medium",
                        sex === option ? "bg-lime text-lime-fg" : "bg-surface text-fg",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <input className={inputClass} placeholder="GhanaPost GPS · GA-123-4567" value={digitalAddress} onChange={(e) => setDigitalAddress(e.target.value)} />
                <input className={inputClass} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <input className={inputClass} placeholder="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
              </div>
              {error ? <p className="mt-3 text-sm text-below">{error}</p> : null}
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  if (!dob || digitalAddress.trim().length < 5 || !city.trim() || occupation.trim().length < 2) {
                    setError("Add your date of birth, GhanaPost GPS, city, and occupation.");
                    return;
                  }
                  setError("");
                  saveAccount(draft());
                  setStep("card");
                }}
              >
                Next
              </Button>
            </section>
          ) : null}
          {step === "card" ? (
            <section className="mt-6">
              <StepLabel n={3} />
              <h1 className="text-2xl font-semibold tracking-tight">Ghana Card</h1>
              <p className="mt-2 text-sm text-muted">Photograph the card, or type the details. The PIN is what the bureaus search on.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("photo")}
                  className={cn("h-11 rounded-full text-sm font-medium", method === "photo" ? "bg-lime text-lime-fg" : "bg-surface")}
                >
                  Take a photo
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("fields")}
                  className={cn("h-11 rounded-full text-sm font-medium", method === "fields" ? "bg-lime text-lime-fg" : "bg-surface")}
                >
                  Type it in
                </button>
              </div>
              {method === "photo" ? (
                <div className="mt-4">
                  {cardPhoto ? (
                    <img src={cardPhoto} alt="Ghana Card preview" className="aspect-[1.6/1] w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex aspect-[1.6/1] items-center justify-center rounded-xl bg-surface text-sm text-muted">
                      Front of the card
                    </div>
                  )}
                  <label className="mt-3 flex h-11 cursor-pointer items-center justify-center rounded-full bg-surface-2 text-sm font-medium">
                    {cardPhoto ? "Retake photo" : "Open camera"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void compressImage(file).then(setCardPhoto);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <input className={inputClass} placeholder="Surname" value={cardSurname} onChange={(e) => setCardSurname(e.target.value)} />
                  <input className={inputClass} placeholder="First names" value={cardFirstNames} onChange={(e) => setCardFirstNames(e.target.value)} />
                  <input className={inputClass} placeholder="Document number" value={cardDoc} onChange={(e) => setCardDoc(e.target.value)} />
                  <input className={inputClass} type="date" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                </div>
              )}
              <input
                className={cn(inputClass, "mt-3 uppercase")}
                placeholder="GHA-000000000-0"
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value)}
              />
              <div className="mt-4 flex flex-col gap-2">
                {DEMO_PINS.map((demo) => (
                  <button
                    key={demo.pin}
                    type="button"
                    onClick={() => {
                      setCardPin(demo.pin);
                      const [first, ...rest] = demo.name.split(" ");
                      setCardFirstNames(first ?? "");
                      setCardSurname(rest.join(" "));
                    }}
                    className="flex min-h-11 items-center justify-between rounded-xl bg-surface px-4 text-left text-sm"
                  >
                    <span>{demo.name}</span>
                    <span className="text-muted">{demo.label}</span>
                  </button>
                ))}
              </div>
              {error ? <p className="mt-3 text-sm text-below">{error}</p> : null}
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  if (!validPin(cardPin)) {
                    setError("Enter the personal ID number as GHA- followed by 9 digits, a hyphen, and a check digit.");
                    return;
                  }
                  if (method === "photo" && !cardPhoto) {
                    setError("Take a photo of the front of the Ghana Card, or switch to typing the fields.");
                    return;
                  }
                  if (method === "fields" && (cardSurname.trim().length < 2 || cardFirstNames.trim().length < 2)) {
                    setError("Type the surname and first names as they appear on the card.");
                    return;
                  }
                  setError("");
                  const next = draft();
                  saveAccount(next);
                  setProfileId(profileForPin(next.cardPin).id);
                  setStep("pay");
                }}
              >
                Next
              </Button>
            </section>
          ) : null}
          {step === "pay" ? (
            <section className="mt-6">
              <StepLabel n={4} />
              <h1 className="text-2xl font-semibold tracking-tight">Pay to pull your file</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {formatMoney(FEE_GHS)} pulls XDS Data Ghana, Dun & Bradstreet, and MyCredit Score against this Ghana Card. Nothing is sent, and no mobile money moves — this checkout is a demo.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {WALLETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWallet(item.id)}
                    className={cn(
                      "flex h-12 items-center justify-between rounded-xl px-4 text-sm font-medium",
                      wallet === item.id ? "bg-lime text-lime-fg" : "bg-surface",
                    )}
                  >
                    {item.label}
                    <span className={wallet === item.id ? "text-lime-fg" : "text-muted"}>{phone || saved?.phone}</span>
                  </button>
                ))}
              </div>
              <Button className="mt-5 w-full" onClick={() => setStep("pull")}>
                Send {formatMoney(FEE_GHS)} prompt
              </Button>
            </section>
          ) : null}
          {step === "pull" ? (
            <PullStep
              wallet={wallet}
              onDone={() => {
                patch({
                  paid: true,
                  paidVia: wallet,
                  paidAt: new Date().toISOString(),
                  signedIn: true,
                });
                const pin = normalizePin(cardPin || saved?.cardPin || "");
                setProfileId(profileForPin(pin).id);
                navigate({ to: "/" });
              }}
            />
          ) : null}
          <p className="mt-8 text-xs leading-relaxed text-subtle">
            SikaScore is not licensed by the Bank of Ghana and is not XDS, Dun & Bradstreet, or MyCredit Score. Your Ghana Card photo stays in this browser.
          </p>
        </main>
      </div>
    </div>
  );
}

function Welcome({
  hasAccount,
  paid,
  onCreate,
  onLogin,
  onReport,
}: {
  hasAccount: boolean;
  paid: boolean;
  onCreate: () => void;
  onLogin: () => void;
  onReport: () => void;
}) {
  return (
    <section className="mt-6">
      <h1 className="text-2xl font-semibold tracking-tight">Check the file on your Ghana Card</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Create an account, add your details, and capture your Ghana Card or type it in. A {formatMoney(FEE_GHS)} mobile-money fee starts the pull from the three licensed bureaus.
      </p>
      <ul className="mt-5 overflow-hidden rounded-xl bg-surface text-sm">
        {["XDS Data Ghana", "Dun & Bradstreet Credit Bureau", "MyCredit Score Limited"].map((name) => (
          <li key={name} className="border-b border-border px-4 py-3 last:border-b-0">
            {name}
          </li>
        ))}
      </ul>
      {paid ? (
        <Button className="mt-5 w-full" onClick={onReport}>
          Open your report
        </Button>
      ) : (
        <Button className="mt-5 w-full" onClick={onCreate}>
          Create account
        </Button>
      )}
      {hasAccount ? (
        <button type="button" className="mt-3 min-h-11 w-full text-sm text-muted" onClick={onLogin}>
          I already have an account
        </button>
      ) : null}
    </section>
  );
}

function StepLabel({ n }: { n: number }) {
  return <p className="text-sm text-muted">Step {n} of 4</p>;
}

function PullStep({ wallet, onDone }: { wallet: Wallet; onDone: () => void }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  const finish = useRef(onDone);
  finish.current = onDone;
  const label = WALLETS.find((w) => w.id === wallet)?.label ?? "Mobile money";
  const names = ["XDS Data Ghana", "Dun & Bradstreet", "MyCredit Score"];

  useEffect(() => {
    if (n < 3) {
      const t = window.setTimeout(() => setN((v) => v + 1), 700);
      return () => window.clearTimeout(t);
    }
    if (done.current) return;
    done.current = true;
    const t = window.setTimeout(() => finish.current(), 500);
    return () => window.clearTimeout(t);
  }, [n]);

  return (
    <section className="mt-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {n < 1 ? `Approved on ${label}` : "Pulling your file"}
      </h1>
      <p className="mt-2 text-sm text-muted">{formatMoney(FEE_GHS)} marked paid in this demo.</p>
      <ul className="mt-5 overflow-hidden rounded-xl bg-surface">
        {names.map((name, i) => (
          <li key={name} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
            <span className="text-sm">{name}</span>
            <span className={cn("text-sm", i < n ? "text-excellent" : "text-subtle")}>
              {i < n ? "Received" : "Waiting"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => resolve("");
    img.src = url;
  });
}