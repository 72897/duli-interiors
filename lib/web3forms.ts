const WEB3FORMS_KEY = "52da37be-e058-4a07-92c1-a07f95c25f6b";

export async function submitToWeb3Forms(subject: string, message: string, fromName = "Duli Interiors") {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: fromName,
      message,
      botcheck: false
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Web3Forms error ${res.status}`);
  }

  return data;
}
