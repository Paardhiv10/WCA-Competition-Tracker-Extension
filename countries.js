// WCA Recognized Countries and Regions List

const WCA_COUNTRIES = [
  { "name": { "common": "Afghanistan" }, "cca2": "AF" },
  { "name": { "common": "Albania" }, "cca2": "AL" },
  { "name": { "common": "Algeria" }, "cca2": "DZ" },
  // { "name": { "common": "American Samoa" }, "cca2": "AS" }, // Non-WCA
  { "name": { "common": "Andorra" }, "cca2": "AD" },
  { "name": { "common": "Angola" }, "cca2": "AO" },
  // { "name": { "common": "Anguilla" }, "cca2": "AI" }, // Non-WCA
  // { "name": { "common": "Antarctica" }, "cca2": "AQ" }, // Non-WCA
  { "name": { "common": "Antigua and Barbuda" }, "cca2": "AG" },
  { "name": { "common": "Argentina" }, "cca2": "AR" },
  { "name": { "common": "Armenia" }, "cca2": "AM" },
  // { "name": { "common": "Aruba" }, "cca2": "AW" }, // Non-WCA
  { "name": { "common": "Australia" }, "cca2": "AU" },
  { "name": { "common": "Austria" }, "cca2": "AT" },
  { "name": { "common": "Azerbaijan" }, "cca2": "AZ" },
  { "name": { "common": "Bahamas" }, "cca2": "BS" },
  { "name": { "common": "Bahrain" }, "cca2": "BH" },
  { "name": { "common": "Bangladesh" }, "cca2": "BD" },
  { "name": { "common": "Barbados" }, "cca2": "BB" },
  { "name": { "common": "Belarus" }, "cca2": "BY" },
  { "name": { "common": "Belgium" }, "cca2": "BE" },
  { "name": { "common": "Belize" }, "cca2": "BZ" },
  { "name": { "common": "Benin" }, "cca2": "BJ" },
  // { "name": { "common": "Bermuda" }, "cca2": "BM" }, // Non-WCA
  { "name": { "common": "Bhutan" }, "cca2": "BT" },
  { "name": { "common": "Bolivia" }, "cca2": "BO" },
  { "name": { "common": "Bosnia and Herzegovina" }, "cca2": "BA" },
  { "name": { "common": "Botswana" }, "cca2": "BW" },
  // { "name": { "common": "Bouvet Island" }, "cca2": "BV" }, // Non-WCA
  { "name": { "common": "Brazil" }, "cca2": "BR" },
  // { "name": { "common": "British Indian Ocean Territory" }, "cca2": "IO" }, // Non-WCA
  { "name": { "common": "Brunei" }, "cca2": "BN" },
  { "name": { "common": "Bulgaria" }, "cca2": "BG" },
  { "name": { "common": "Burkina Faso" }, "cca2": "BF" },
  { "name": { "common": "Burundi" }, "cca2": "BI" },
  { "name": { "common": "Cabo Verde" }, "cca2": "CV" },
  { "name": { "common": "Cambodia" }, "cca2": "KH" },
  { "name": { "common": "Cameroon" }, "cca2": "CM" },
  { "name": { "common": "Canada" }, "cca2": "CA" },
  // { "name": { "common": "Cayman Islands" }, "cca2": "KY" }, // Non-WCA
  { "name": { "common": "Central African Republic" }, "cca2": "CF" },
  { "name": { "common": "Chad" }, "cca2": "TD" },
  { "name": { "common": "Chile" }, "cca2": "CL" },
  { "name": { "common": "China" }, "cca2": "CN" },
  { "name": { "common": "Chinese Taipei" }, "cca2": "TW" },
  // { "name": { "common": "Christmas Island" }, "cca2": "CX" }, // Non-WCA
  // { "name": { "common": "Cocos (Keeling) Islands" }, "cca2": "CC" }, // Non-WCA
  { "name": { "common": "Colombia" }, "cca2": "CO" },
  { "name": { "common": "Comoros" }, "cca2": "KM" },
  { "name": { "common": "Congo" }, "cca2": "CG" },
  // { "name": { "common": "Cook Islands" }, "cca2": "CK" }, // Non-WCA
  { "name": { "common": "Costa Rica" }, "cca2": "CR" },
  { "name": { "common": "Croatia" }, "cca2": "HR" },
  { "name": { "common": "Cuba" }, "cca2": "CU" },
  { "name": { "common": "Cyprus" }, "cca2": "CY" },
  { "name": { "common": "Czech Republic" }, "cca2": "CZ" },
  { "name": { "common": "C\u00f4te d'Ivoire" }, "cca2": "CI" },
  { "name": { "common": "Democratic People's Republic of Korea" }, "cca2": "KP" },
  { "name": { "common": "Democratic Republic of the Congo" }, "cca2": "CD" },
  { "name": { "common": "Denmark" }, "cca2": "DK" },
  { "name": { "common": "Djibouti" }, "cca2": "DJ" },
  { "name": { "common": "Dominica" }, "cca2": "DM" },
  { "name": { "common": "Dominican Republic" }, "cca2": "DO" },
  { "name": { "common": "Ecuador" }, "cca2": "EC" },
  { "name": { "common": "Egypt" }, "cca2": "EG" },
  { "name": { "common": "El Salvador" }, "cca2": "SV" },
  { "name": { "common": "Equatorial Guinea" }, "cca2": "GQ" },
  { "name": { "common": "Eritrea" }, "cca2": "ER" },
  { "name": { "common": "Estonia" }, "cca2": "EE" },
  { "name": { "common": "Eswatini" }, "cca2": "SZ" },
  { "name": { "common": "Ethiopia" }, "cca2": "ET" },
  // { "name": { "common": "Falkland Islands" }, "cca2": "FK" }, // Non-WCA
  // { "name": { "common": "Faroe Islands" }, "cca2": "FO" }, // Non-WCA
  { "name": { "common": "Federated States of Micronesia" }, "cca2": "FM" },
  { "name": { "common": "Fiji" }, "cca2": "FJ" },
  { "name": { "common": "Finland" }, "cca2": "FI" },
  { "name": { "common": "France" }, "cca2": "FR" },
  // { "name": { "common": "French Guiana" }, "cca2": "GF" }, // Non-WCA
  // { "name": { "common": "French Polynesia" }, "cca2": "PF" }, // Non-WCA
  // { "name": { "common": "French Southern territories" }, "cca2": "TF" }, // Non-WCA
  { "name": { "common": "Gabon" }, "cca2": "GA" },
  { "name": { "common": "Gambia" }, "cca2": "GM" },
  { "name": { "common": "Georgia" }, "cca2": "GE" },
  { "name": { "common": "Germany" }, "cca2": "DE" },
  { "name": { "common": "Ghana" }, "cca2": "GH" },
  // { "name": { "common": "Gibraltar" }, "cca2": "GI" }, // Non-WCA
  { "name": { "common": "Greece" }, "cca2": "GR" },
  // { "name": { "common": "Greenland" }, "cca2": "GL" }, // Non-WCA
  { "name": { "common": "Grenada" }, "cca2": "GD" },
  // { "name": { "common": "Guadeloupe" }, "cca2": "GP" }, // Non-WCA
  // { "name": { "common": "Guam" }, "cca2": "GU" }, // Non-WCA
  { "name": { "common": "Guatemala" }, "cca2": "GT" },
  // { "name": { "common": "Guernsey" }, "cca2": "GG" }, // Non-WCA
  { "name": { "common": "Guinea" }, "cca2": "GN" },
  { "name": { "common": "Guinea Bissau" }, "cca2": "GW" },
  { "name": { "common": "Guyana" }, "cca2": "GY" },
  { "name": { "common": "Haiti" }, "cca2": "HT" },
  // { "name": { "common": "Heard Island and McDonald Islands" }, "cca2": "HM" }, // Non-WCA
  { "name": { "common": "Honduras" }, "cca2": "HN" },
  { "name": { "common": "Hong Kong, China" }, "cca2": "HK" },
  { "name": { "common": "Hungary" }, "cca2": "HU" },
  { "name": { "common": "Iceland" }, "cca2": "IS" },
  { "name": { "common": "India" }, "cca2": "IN" },
  { "name": { "common": "Indonesia" }, "cca2": "ID" },
  { "name": { "common": "Iran" }, "cca2": "IR" },
  { "name": { "common": "Iraq" }, "cca2": "IQ" },
  { "name": { "common": "Ireland" }, "cca2": "IE" },
  // { "name": { "common": "Isle of Man" }, "cca2": "IM" }, // Non-WCA
  { "name": { "common": "Israel" }, "cca2": "IL" },
  { "name": { "common": "Italy" }, "cca2": "IT" },
  { "name": { "common": "Jamaica" }, "cca2": "JM" },
  { "name": { "common": "Japan" }, "cca2": "JP" },
  // { "name": { "common": "Jersey" }, "cca2": "JE" }, // Non-WCA
  { "name": { "common": "Jordan" }, "cca2": "JO" },
  { "name": { "common": "Kazakhstan" }, "cca2": "KZ" },
  { "name": { "common": "Kenya" }, "cca2": "KE" },
  { "name": { "common": "Kiribati" }, "cca2": "KI" },
  { "name": { "common": "Kosovo" }, "cca2": "XK" },
  { "name": { "common": "Kuwait" }, "cca2": "KW" },
  { "name": { "common": "Kyrgyzstan" }, "cca2": "KG" },
  { "name": { "common": "Laos" }, "cca2": "LA" },
  { "name": { "common": "Latvia" }, "cca2": "LV" },
  { "name": { "common": "Lebanon" }, "cca2": "LB" },
  { "name": { "common": "Lesotho" }, "cca2": "LS" },
  { "name": { "common": "Liberia" }, "cca2": "LR" },
  { "name": { "common": "Libya" }, "cca2": "LY" },
  { "name": { "common": "Liechtenstein" }, "cca2": "LI" },
  { "name": { "common": "Lithuania" }, "cca2": "LT" },
  { "name": { "common": "Luxembourg" }, "cca2": "LU" },
  { "name": { "common": "Macau, China" }, "cca2": "MO" },
  { "name": { "common": "Madagascar" }, "cca2": "MG" },
  { "name": { "common": "Malawi" }, "cca2": "MW" },
  { "name": { "common": "Malaysia" }, "cca2": "MY" },
  { "name": { "common": "Maldives" }, "cca2": "MV" },
  { "name": { "common": "Mali" }, "cca2": "ML" },
  { "name": { "common": "Malta" }, "cca2": "MT" },
  { "name": { "common": "Marshall Islands" }, "cca2": "MH" },
  // { "name": { "common": "Martinique" }, "cca2": "MQ" }, // Non-WCA
  { "name": { "common": "Mauritania" }, "cca2": "MR" },
  { "name": { "common": "Mauritius" }, "cca2": "MU" },
  // { "name": { "common": "Mayotte" }, "cca2": "YT" }, // Non-WCA
  { "name": { "common": "Mexico" }, "cca2": "MX" },
  { "name": { "common": "Moldova" }, "cca2": "MD" },
  { "name": { "common": "Monaco" }, "cca2": "MC" },
  { "name": { "common": "Mongolia" }, "cca2": "MN" },
  { "name": { "common": "Montenegro" }, "cca2": "ME" },
  // { "name": { "common": "Montserrat" }, "cca2": "MS" }, // Non-WCA
  { "name": { "common": "Morocco" }, "cca2": "MA" },
  { "name": { "common": "Mozambique" }, "cca2": "MZ" },
  { "name": { "common": "Myanmar" }, "cca2": "MM" },
  { "name": { "common": "Namibia" }, "cca2": "NA" },
  { "name": { "common": "Nauru" }, "cca2": "NR" },
  { "name": { "common": "Nepal" }, "cca2": "NP" },
  { "name": { "common": "Netherlands" }, "cca2": "NL" },
  // { "name": { "common": "Netherlands Antilles" }, "cca2": "AN" }, // Non-WCA
  // { "name": { "common": "New Caledonia" }, "cca2": "NC" }, // Non-WCA
  { "name": { "common": "New Zealand" }, "cca2": "NZ" },
  { "name": { "common": "Nicaragua" }, "cca2": "NI" },
  { "name": { "common": "Niger" }, "cca2": "NE" },
  { "name": { "common": "Nigeria" }, "cca2": "NG" },
  // { "name": { "common": "Niue" }, "cca2": "NU" }, // Non-WCA
  // { "name": { "common": "Norfolk Island" }, "cca2": "NF" }, // Non-WCA
  { "name": { "common": "North Macedonia" }, "cca2": "MK" },
  // { "name": { "common": "Northern Ireland" }, "cca2": "GB" }, // Non-WCA
  // { "name": { "common": "Northern Mariana Islands" }, "cca2": "MP" }, // Non-WCA
  { "name": { "common": "Norway" }, "cca2": "NO" },
  { "name": { "common": "Oman" }, "cca2": "OM" },
  { "name": { "common": "Pakistan" }, "cca2": "PK" },
  { "name": { "common": "Palau" }, "cca2": "PW" },
  { "name": { "common": "Palestine" }, "cca2": "PS" },
  { "name": { "common": "Panama" }, "cca2": "PA" },
  { "name": { "common": "Papua New Guinea" }, "cca2": "PG" },
  { "name": { "common": "Paraguay" }, "cca2": "PY" },
  { "name": { "common": "Peru" }, "cca2": "PE" },
  { "name": { "common": "Philippines" }, "cca2": "PH" },
  // { "name": { "common": "Pitcairn" }, "cca2": "PN" }, // Non-WCA
  { "name": { "common": "Poland" }, "cca2": "PL" },
  { "name": { "common": "Portugal" }, "cca2": "PT" },
  // { "name": { "common": "Puerto Rico" }, "cca2": "PR" }, // Non-WCA
  { "name": { "common": "Qatar" }, "cca2": "QA" },
  { "name": { "common": "Republic of Korea" }, "cca2": "KR" },
  // { "name": { "common": "Reunion" }, "cca2": "RE" }, // Non-WCA
  { "name": { "common": "Romania" }, "cca2": "RO" },
  { "name": { "common": "Russia" }, "cca2": "RU" },
  { "name": { "common": "Rwanda" }, "cca2": "RW" },
  // { "name": { "common": "Saint Helena" }, "cca2": "SH" }, // Non-WCA
  { "name": { "common": "Saint Kitts and Nevis" }, "cca2": "KN" },
  { "name": { "common": "Saint Lucia" }, "cca2": "LC" },
  // { "name": { "common": "Saint Pierre and Miquelon" }, "cca2": "PM" }, // Non-WCA
  { "name": { "common": "Saint Vincent and the Grenadines" }, "cca2": "VC" },
  { "name": { "common": "Samoa" }, "cca2": "WS" },
  { "name": { "common": "San Marino" }, "cca2": "SM" },
  { "name": { "common": "Saudi Arabia" }, "cca2": "SA" },
  { "name": { "common": "Senegal" }, "cca2": "SN" },
  { "name": { "common": "Serbia" }, "cca2": "RS" },
  { "name": { "common": "Seychelles" }, "cca2": "SC" },
  { "name": { "common": "Sierra Leone" }, "cca2": "SL" },
  { "name": { "common": "Singapore" }, "cca2": "SG" },
  { "name": { "common": "Slovakia" }, "cca2": "SK" },
  { "name": { "common": "Slovenia" }, "cca2": "SI" },
  { "name": { "common": "Solomon Islands" }, "cca2": "SB" },
  { "name": { "common": "Somalia" }, "cca2": "SO" },
  { "name": { "common": "South Africa" }, "cca2": "ZA" },
  // { "name": { "common": "South Georgia and the South Sandwich Islands" }, "cca2": "GS" }, // Non-WCA
  { "name": { "common": "South Sudan" }, "cca2": "SS" },
  { "name": { "common": "Spain" }, "cca2": "ES" },
  { "name": { "common": "Sri Lanka" }, "cca2": "LK" },
  { "name": { "common": "Sudan" }, "cca2": "SD" },
  { "name": { "common": "Suriname" }, "cca2": "SR" },
  // { "name": { "common": "Svalbard and Jan Mayen" }, "cca2": "SJ" }, // Non-WCA
  { "name": { "common": "Sweden" }, "cca2": "SE" },
  { "name": { "common": "Switzerland" }, "cca2": "CH" },
  { "name": { "common": "Syria" }, "cca2": "SY" },
  { "name": { "common": "S\u00e3o Tom\u00e9 and Pr\u00edncipe" }, "cca2": "ST" },
  { "name": { "common": "Tajikistan" }, "cca2": "TJ" },
  { "name": { "common": "Tanzania" }, "cca2": "TZ" },
  { "name": { "common": "Thailand" }, "cca2": "TH" },
  { "name": { "common": "Timor-Leste" }, "cca2": "TP" },
  { "name": { "common": "Timor-Leste" }, "cca2": "TL" },
  { "name": { "common": "Togo" }, "cca2": "TG" },
  // { "name": { "common": "Tokelau" }, "cca2": "TK" }, // Non-WCA
  { "name": { "common": "Tonga" }, "cca2": "TO" },
  { "name": { "common": "Trinidad and Tobago" }, "cca2": "TT" },
  { "name": { "common": "Tunisia" }, "cca2": "TN" },
  { "name": { "common": "Turkey" }, "cca2": "TR" },
  { "name": { "common": "Turkmenistan" }, "cca2": "TM" },
  // { "name": { "common": "Turks and Caicos Islands" }, "cca2": "TC" }, // Non-WCA
  { "name": { "common": "Tuvalu" }, "cca2": "TV" },
  { "name": { "common": "Uganda" }, "cca2": "UG" },
  { "name": { "common": "Ukraine" }, "cca2": "UA" },
  { "name": { "common": "United Arab Emirates" }, "cca2": "AE" },
  { "name": { "common": "United Kingdom" }, "cca2": "UK" },
  { "name": { "common": "United States" }, "cca2": "US" },
  // { "name": { "common": "United States Minor Outlying Islands" }, "cca2": "UM" }, // Non-WCA
  { "name": { "common": "Uruguay" }, "cca2": "UY" },
  { "name": { "common": "Uzbekistan" }, "cca2": "UZ" },
  { "name": { "common": "Vanuatu" }, "cca2": "VU" },
  { "name": { "common": "Vatican City" }, "cca2": "VA" },
  { "name": { "common": "Venezuela" }, "cca2": "VE" },
  { "name": { "common": "Vietnam" }, "cca2": "VN" },
  // { "name": { "common": "Virgin Islands, British" }, "cca2": "VG" }, // Non-WCA
  // { "name": { "common": "Virgin Islands, U.S." }, "cca2": "VI" }, // Non-WCA
  // { "name": { "common": "Wallis and Futuna" }, "cca2": "WF" }, // Non-WCA
  // { "name": { "common": "Western Sahara" }, "cca2": "EH" }, // Non-WCA
  { "name": { "common": "Yemen" }, "cca2": "YE" },
  { "name": { "common": "Zambia" }, "cca2": "ZM" },
  { "name": { "common": "Zimbabwe" }, "cca2": "ZW" },
];
