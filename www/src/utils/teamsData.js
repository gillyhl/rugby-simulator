const createTeamBadge = (initials, bgColor, textColor = "#fff") => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(bgColor)}'/%3E%3Ctext x='50' y='60' font-size='40' font-weight='bold' text-anchor='middle' fill='${encodeURIComponent(textColor)}'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

export const TEAM_DATA = {
  "Bath": {
    logo: "https://upload.wikimedia.org/wikipedia/en/e/ef/Bath_Rugby_logo.png",
    color: "bg-blue-900"
  },
  "Bristol Bears": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Bristol_Bears_logo.svg/1920px-Bristol_Bears_logo.svg.png",
    color: "bg-blue-600"
  },
  "Exeter Chiefs": {
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b7/Exeter_Chiefs_new_logo_2022.png",
    color: "bg-red-900"
  },
  "Gloucester": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Gloucester_Rugby_%282018%29_logo.svg/1920px-Gloucester_Rugby_%282018%29_logo.svg.png",
    color: "bg-red-700"
  },
  "Harlequins": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Harlequin_FC_logo.svg/1280px-Harlequin_FC_logo.svg.png",
    color: "bg-red-700",
    logoStyle: { backgroundColor: "#fff", left: "59px", top: "98px" }
  },
  "Leicester Tigers": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Leicester_Tigers_logo.svg/330px-Leicester_Tigers_logo.svg.png",
    color: "bg-amber-800"
  },
  "Northampton Saints": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Northampton_Saints_Logo.svg/1920px-Northampton_Saints_Logo.svg.png",
    color: "bg-slate-800",
    logoStyle: { left: "43px", top: "18px" }
  },
  "Sale Sharks": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Sale_Sharks_logo.svg/3840px-Sale_Sharks_logo.svg.png",
    color: "bg-slate-700",
    logoStyle: { backgroundColor: "#fff", borderRadius: "50%", padding: "5px" }
  },
  "Saracens": {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Saracens_F.C._Logo.svg/3840px-Saracens_F.C._Logo.svg.png",
    color: "bg-black",
    logoStyle: { top: "43px" }
  },
  "Newcastle Falcons": {
    logo: "https://upload.wikimedia.org/wikipedia/en/8/80/Newcastle_Red_Bulls_logo.png",
    color: "bg-slate-800"
  }
};

export function getTeamLogo(teamName) {
  return TEAM_DATA[teamName]?.logo || null;
}

export function getTeamLogoStyle(teamName) {
  return TEAM_DATA[teamName]?.logoStyle || {};
}

export function getTeamColor(teamName) {
  return TEAM_DATA[teamName]?.color || "bg-neutral-800";
}
