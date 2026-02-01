import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  const fontData = await readFile(
    "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
  );

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#141414",
          padding: "40px",
          fontFamily: "JetBrains Mono",
        },
        children: {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              border: "2px solid #33ff66",
              borderRadius: "12px",
              padding: "60px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#33ff66",
                          opacity: 0.5,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#33ff66",
                          opacity: 0.3,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#33ff66",
                          opacity: 0.2,
                        },
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "72px",
                    color: "#33ff66",
                    marginTop: "40px",
                    lineHeight: 1.1,
                  },
                  children: "> climp",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    color: "#33ff66",
                    opacity: 0.5,
                    marginTop: "20px",
                  },
                  children: "a minimal cli media player",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    color: "#33ff66",
                    opacity: 0.3,
                    marginTop: "auto",
                  },
                  children: "written in go | climp.net",
                },
              },
            ],
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
