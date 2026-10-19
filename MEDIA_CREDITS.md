# MIC visual redesign — media register

Downloaded and checked October 18, 2026. Public-facing credits: `/credits`.

All stock media below is provided under the [Pexels licence](https://www.pexels.com/license/). It allows website use and modification, with restrictions including no implied endorsement. No stock image is used in MIC’s logo. People shown are not claimed to be MIC members. The mosque image illustrates the discovery category, not a particular Canadian mosque. The footage shows Toronto but does not document an MIC event.

| Local asset | Creator | Source |
| --- | --- | --- |
| `public/media/community-friends.jpg` | MART PRODUCTION | https://www.pexels.com/photo/woman-taking-photo-of-her-friend-8122043/ |
| `public/media/prayer-space.jpg` | Esra Erdem | https://www.pexels.com/photo/columns-and-red-carpet-in-mosque-20719987/ |
| `public/media/shared-table.jpg` | Ali Dashti | https://www.pexels.com/photo/abundance-of-food-on-table-25907496/ |
| `public/media/volunteers.jpg` | cottonbro studio | https://www.pexels.com/photo/two-volunteers-packing-the-charity-goods-6590929/ |
| `public/media/toronto-sunset.mp4` and poster | Mohammed Abubakr | https://www.pexels.com/video/sunset-over-toronto-12655275/ |

Photos were downloaded at a web-friendly size and are displayed using Next.js image optimization. The original 1080 × 1920, 60 fps Toronto clip was compressed to 540 × 960 without audio. The delivered video is approximately 1.9 MB, loads only when requested, and uses native playback controls. It has no speech or audio content requiring captions; its accessible label and nearby description identify it as silent Toronto stock footage. The poster is extracted from that same clip.

`scripts/download-visuals.mjs` reproduces the downloads and web conversion. It requires Node.js and FFmpeg. Original working footage is ignored under `.media-work/`.

The approved MIC logo is `public/brand/mic-maple-emblem-red-green-white.png`, generated and approved earlier in this chat. Its design is not altered by this redesign. An AI community illustration was generated before the user requested web-sourced media; it is not included in the portal.

Animation: slow image movement, decorative rotation, and a scrolling typographic strip. The visible Pause motion control pauses decorative animations, and the operating system's reduced-motion preference disables them. No video autoplays.

## Official channel and publisher media
The Community Voices section uses thumbnail URLs from official YouTube video IDs, linked to each original video and channel. YouTube players are embedded on demand using youtube-nocookie.com. These are third-party media, not MIC-owned footage. See lib/editorial-config.ts for official social/profile links.
The newsroom uses publisher-supplied RSS image URLs where available, credited alongside the headline and linked to the original article. They are displayed in the context of the originating feed, not downloaded or offered as reusable MIC media. Missing images use original MIC CSS/SVG editorial illustrations clearly labelled "Publisher illustration"; these do not depict reported events. Sources: Muslim Network TV and MuslimMatters.
