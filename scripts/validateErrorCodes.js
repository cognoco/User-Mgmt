#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const apiCodesPath = path.join('src', 'lib', 'api', 'common', 'error-codes.ts');
const docPath = path.join('docs', 'Product documentation', 'Error Code Reference.md');

function extractApiCodes(file) {
  const text = fs.readFileSync(file, 'utf8');
  const matches = text.match(/'([a-z]+\/[a-z_]+)'/g) || [];
  return matches.map((m) => m.slice(1, -1));
}

function validateDuplicates(codes) {
  const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
  if (dupes.length) {
    console.error('Duplicate codes found:', Array.from(new Set(dupes)).join(', '));
    return false;
  }
  return true;
}

function validateNaming(codes) {
  const pattern = /^[a-z]+\/[a-z_]+$/;
  let valid = true;
  for (const c of codes) {
    if (!pattern.test(c)) {
      console.error('Invalid code naming:', c);
      valid = false;
    }
  }
  return valid;
}

function validateDocs(codes) {
  const docText = fs.readFileSync(docPath, 'utf8');
  let valid = true;
  for (const c of codes) {
    if (!docText.includes(c)) {
      console.error('Code missing from docs:', c);
      valid = false;
    }
  }
  return valid;
}

function validateDocExtra(codes) {
  const docText = fs.readFileSync(docPath, 'utf8');
  const docMatches = docText.match(/\|\s*([a-z]+\/[a-z_]+)\s*\|/g) || [];
  const docCodes = docMatches.map((m) => m.split('|')[1].trim());
  const extras = docCodes.filter((c) => !codes.includes(c));
  if (extras.length) {
    console.error('Codes documented but not defined:', extras.join(', '));
    return false;
  }
  return true;
}

const codes = extractApiCodes(apiCodesPath);
let ok = true;
ok = validateDuplicates(codes) && ok;
ok = validateNaming(codes) && ok;
ok = validateDocs(codes) && ok;
ok = validateDocExtra(codes) && ok;

if (!ok) {
  console.error('Error code validation failed.');
  process.exit(1);
}
console.log('All error codes validated successfully.');
