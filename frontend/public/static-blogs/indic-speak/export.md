# Indic-Speak — request parameters

Every parameter a caller can send, once each. The contract also accepts `text`,
`speaker` and `nvext.repetition_penalty`; those are not separate parameters and are
listed against the ones they stand for.

Generated from `verify_api/CONTRACT.md` by `blog/src/apigen.py` — edit the contract,
not this file.

```http
POST /v1/audio/speech
Content-Type: application/json

{
  "prompt": "भारत एक हज़ार नौ सौ सैंतालीस में स्वतंत्र हुआ।",
  "model": "bodhan-tts",
  "voice_clone_id": "Amit",
  "style": "news"
}
```

## Parameters

| parameter | type | default | what it does |
|---|---|---|---|
| `prompt` | string | **required** | The text to speak, normalised the way you want it read. Also accepted as `text`. |
| `model` | string | **required** | Which model to run. Send `bodhan-tts`. |
| `voice_clone_id` | string | `"Amit"` | Which of the 45 voices reads it. Also accepted as `speaker`. |
| `style` | string | none applied | Delivery register. Omit it for the conversational default. |
| `temperature` | float | `0.6` | Sampling randomness. Lower is steadier, higher is more varied. |
| `top_p` | float | `0.9` | Nucleus sampling cutoff. |
| `top_k` | int | `50` | Sampling pool size. |
| `repetition_penalty` | float | `1.2` | Discourages the model from repeating itself. Also accepted as `nvext.repetition_penalty`. |
| `max_tokens` | int | `2520` | Hard ceiling on generated audio length. |

## Caveats

Behaviours that will surprise a caller. These are properties of the interface, not
of the audio.

- **`prompt` — It is not required, and omitting it is not an error.** A request with a missing or misspelled `prompt` returns `200` and a few seconds of audio rather than a `4xx`. Validate that the field is present and non-empty before sending.
- **`model` — It is not validated.** Omitting it, or sending a model that does not exist, still returns `200`. Send the right value for correctness, but do not rely on a wrong one failing loudly.
- **`voice_clone_id` — The name is misleading: there is no voice cloning.** It selects a library voice by name. There is no reference audio and no cloning, despite the field name. An unknown name returns `422`.
- **`style` — An unknown style is rejected, and the casing is exact.** Styles are matched literally, so a display-cased string will not do. An unknown style returns `422`.
- **`top_p` — It applies only when strictly between 0 and 1.** Sending `0` or `1` silently disables it rather than clamping.
- **`top_k` — It is not exclusive with `top_p`: both apply at once.** Setting one does not switch the other off. Setting `top_k` to `1` makes generation greedy, which is the only way to get a byte-for-byte reproducible result: there is no seed parameter, so at the default temperature two identical requests return different audio.
- **`repetition_penalty` — A nested field can override it.** `nvext.repetition_penalty` is accepted and takes precedence over the top-level value. Send one or the other, not both.
- **`max_tokens` — Reaching the ceiling truncates the audio without an error.** The default is about thirty seconds of speech. Longer passages have to be split at punctuation and joined by the caller; the endpoint will not do it.
- **Any request — Unknown fields are ignored, not rejected.** Any field outside this list (including `language` and `seed`) returns `200` and has no effect, so a typo in a parameter name is silently dropped. There is no language field at all; the language is inferred from the text.
- **Any request — Every client-side error arrives as `422`.** The gateway collapses the backend’s `4xx` responses into one status, and the real cause appears only in the message string. You cannot tell a bad voice from a bad style by status code; validate client-side against the voice and style lists. Saturation returns `429` or `503`, both retryable with backoff.

## Voices — 45

Library voices only, selected by name. The language is inferred from the text.

| code | language | female | male |
|---|---|---|---|
| `as` | Assamese | Prastuti | Ankur |
| `bn` | Bengali | Ishita | Sourav |
| `brx` | Bodo | Gwrbw | Sansuma |
| `doi` | Dogri | Preeti | Sham |
| `gu` | Gujarati | Dhara | Parth |
| `hi` | Hindi | Kavya, Suhani | Amit |
| `kn` | Kannada | Deepika | Adarsh |
| `kok` | Konkani | Anjali | Sandeep |
| `ks` | Kashmiri | Zoon | Ishfaq |
| `mai` | Maithili | Vaidehi | Madhukar |
| `ml` | Malayalam | Lakshmi | Kiran |
| `mni` | Manipuri | Thoibi | Chaoba |
| `mr` | Marathi | Anagha | Chinmay |
| `ne` | Nepali | Srijana | Sagar |
| `or` | Odia | Itishree | Akash |
| `pa` | Punjabi | Kaur | Manpreet |
| `sa` | Sanskrit | Bharati | Aryaman |
| `sat` | Santali | Phulmani | Sibu |
| `sd` | Sindhi | Moomal | Rano |
| `ta` | Tamil | Anitha | Arun |
| `te` | Telugu | Sravani | Vamsi |
| `ur` | Urdu | Saba | Zaid |

## Styles — 14

Matched literally, so the casing below is the casing to send. Omit `style` for the
conversational default.

- `AIR style news`
- `Customer Care`
- `TV style news`
- `advertisements`
- `anger`
- `children's stories`
- `disgust`
- `educational lecture`
- `fear`
- `happy`
- `news`
- `sad`
- `single person narration audiobook`
- `surprise`
