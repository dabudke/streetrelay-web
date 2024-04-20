import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => /@[A-Za-z0-9_]{2,20}/.test(param);
