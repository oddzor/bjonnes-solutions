// Contact details are taken from the Bjønnes Solutions Facebook page.
export const site = {
  name: "Bjønnes Solutions",
  owner: "Tommy",
  phoneDisplay: "469 49 292",
  phoneHref: "tel:+4746949292",
  smsHref: "sms:+4746949292",
  email: "tommybjo@live.no",
  street: "Setretangen 16",
  postalCode: "3961",
  city: "Stathelle",
  facebook: "https://www.facebook.com/profile.php?id=100067370348558",
} as const;

// The four services that happen above ground, left to right as they stand in the drawing.
export const surface = [
  {
    name: "Trefelling",
    text: "Trær som står trangt eller i veien felles og ryddes bort.",
    art: "trefelling",
  },
  {
    name: "Hytteservice",
    text: "Tilsyn, rydding og småjobber på hytta når du ikke er der selv.",
    art: "hytte",
  },
  {
    name: "Eiendomsdrift",
    text: "Vedlikehold av uteområder gjennom hele året.",
    art: "eiendom",
  },
  {
    name: "Maskinutleie",
    text: "Lei gravemaskin når du vil gjøre jobben selv.",
    art: "utleie",
  },
] as const;

export const digging = [
  { name: "Tomter", text: "Graves ut og gjøres klare for grunnmur." },
  { name: "Grøfter", text: "For vann, avløp og kabler." },
  { name: "Planering", text: "Underlaget rettes av og gjøres ferdig." },
] as const;

export const blasting = [
  { name: "Grøfter", text: "Der traseen går gjennom fjell." },
  { name: "Boligtomter", text: "Fjellet tas ned til riktig høyde for huset." },
  { name: "Industritomter", text: "Større uttak når det skal bygges stort." },
] as const;

// Their own words, from a post on the Facebook page.
export const quote =
  "Full fart i markedet om dagen med alt fra sprengning av grøfter, industritomter og boligtomter til graving og maskinutleie!";

// Photos in public/images are stock placeholders, see public/images/SOURCES.md.
export const photos = [
  { src: "/images/gravemaskin.jpg", alt: "Gravemaskin som laster sprengt stein i et fjelluttak" },
  { src: "/images/minilaster.jpg", alt: "Maskin som flytter masser på ei tomt i skogkanten" },
  { src: "/images/anlegg.jpg", alt: "Gravemaskiner på et større anleggsområde i lav sol" },
] as const;

export const faq = [
  {
    question: "Tar dere små jobber?",
    answer: "Ja. Ei grøft, ei tomt eller ett tre er nok til å ta en telefon.",
  },
  {
    question: "Kan jeg leie maskin og kjøre selv?",
    answer: `Ja, maskiner leies ut. Ring ${site.phoneDisplay} og hør hva som er ledig.`,
  },
  {
    question: "Hva koster det?",
    answer: "Prisen avtales for hver jobb. Fortell hva som skal gjøres, så får du et svar.",
  },
  {
    question: "Hvor tar dere oppdrag?",
    answer: `Vi holder til på ${site.city}. Ring og spør om stedet ditt.`,
  },
] as const;
