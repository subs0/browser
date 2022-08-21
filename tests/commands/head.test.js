import { fireEvent } from "@testing-library/dom"

import {
    URL_DATA,
    CMD_SUB$,
    CMD_ARGS,
    CMD_WORK,
    DOM_HEAD,
    HD_ICON,
    HD_TITL,
    HD_DESC,
    HD_IMGH,
    HD_IMGU,
    HD_IMGW,
    HD_TYPE,
} from "@-0/keys"
import { run$, registerCMD } from "@-0/spool"
import { cmd_inject_head } from "../../src/commands"
//import { JSDOM } from "jsdom"

const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="once upon a midnight weary" />
    <meta
        property="og:description"
        content="I pondered weak and weary over a many volume of forgotten lore"
    />
    <meta
        property="og:image"
        content="https://www.census.gov/content/dam/Census/public/brand/census-logo-sharing-card.jpg"
    />
    <meta property="og:image:width" content="1600" />
    <meta property="og:image:height" content="900" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Parade of Fans for Houston’s Funeral" />
    <meta name="twitter:description" content="a twitter card description" />
    <meta name="twitter:image" content="some.jpg" />
    <link rel="apple-touch-icon" sizes="57x57" href="assets/apple-icon-57x57.png" />
    <title>Page Title</title>
  </head>
</html>
`
// prettier-ignore
const head_post = ` 
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:type" content="image">
    <meta property="og:title" content="changed">
    <meta property="og:description" content="times are a changin'">
    <meta property="og:image" content="https://images.com/2">
    <meta property="og:image:width" content="400">
    <meta property="og:image:height" content="500">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="changed">
    <meta name="twitter:description" content="times are a changin'">
    <meta name="twitter:image" content="https://images.com/2">
    <title>changed</title>
    <link rel="shortcut icon" sizes="57x57" href="NA" type="image/x-icon">
`

//const warned = (x = jest.fn()) => (jest.spyOn(console, "warn").mockImplementation(x), x)

const INJECT_HEAD = registerCMD(cmd_inject_head)

describe("head", () => {
    beforeEach(() => {
        // https://dev.to/thawkin3/how-to-unit-test-html-and-vanilla-javascript-without-a-ui-framework-4io
        // Constructing a new JSDOM with this option is the key
        // to getting the code in the script tag to execute.
        // This is indeed dangerous and should only be done with trusted content.
        // https://github.com/jsdom/jsdom#executing-scripts

        //dom = new JSDOM(html, { runScripts: "dangerously" })
        //global.window = dom.window
        //global.document = dom.window.document
        //global.document.head.innerHTML = dom.window.document.head.innerHTML
        document.head.innerHTML = html
    })
    test("head Command", () => {
        //console.log({ container: document.head.innerHTML })
        run$.next({
            ...INJECT_HEAD,
            [CMD_ARGS]: {
                [URL_DATA]: {
                    [DOM_HEAD]: {
                        [HD_TITL]: "changed",
                        [HD_DESC]: "times are a changin'",
                        [HD_IMGU]: "https://images.com/2",
                        [HD_IMGH]: "500",
                        [HD_IMGW]: "400",
                        [HD_ICON]: "NA",
                        [HD_TYPE]: "image",
                    },
                },
            },
        })
        expect(document.head.innerHTML.replace(/ +(?= )|^\s*\n/g, "").replace(/\s/g, "")).toBe(
            head_post.replace(/\s/g, "")
        )
    })
})
