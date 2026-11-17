import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const url = 'https://stackblitz.com/github/nasirBataruna/axen-kit-playground/tree/k2-a04-preview';
const report = { target:url, origin:'GitHub Actions Chromium external StackBlitz importer', result:'NOT_VERIFIED', attempts:0, frames:[], checks:[], details:'' };
let browser;
try {
  browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{width:1365,height:900} });
  page.on('pageerror', error => { report.details = String(error).slice(0,250); });
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  const deadline = Date.now()+65000;
  let liveFrame;
  while(Date.now()<deadline && !liveFrame){
    report.attempts++;
    for(const frame of page.frames()){
      try {
        if(await frame.locator('a[href*="/scenario/I01"]').count() > 0){
          liveFrame=frame;
          break;
        }
      }catch{}
    }
    if(!liveFrame)await page.waitForTimeout(1500);
  }
  report.frames=page.frames().map(f=>f.url().slice(0,220));
  if(!liveFrame)throw new Error('StackBlitz editor accessible but live app iframe not evidenced');
  const integrated=liveFrame.locator('a[href*="/scenario/I01"]').first();
  await integrated.click({timeout:12000});
  await liveFrame.locator('[data-axen-kit-shell="kit-form-playground"]').waitFor({state:'visible',timeout:15000});
  report.checks.push('real KitAppShell rendered inside StackBlitz frame');
  await liveFrame.locator('input[name="fullName"]').fill('StackBlitz Demo');
  await liveFrame.locator('input[name="email"]').fill('stackblitz@example.invalid');
  await liveFrame.getByRole('button',{name:'Submit Kit + Form'}).click();
  await liveFrame.locator('[data-submit-state="success"]').waitFor({state:'visible',timeout:14000});
  report.checks.push('real AxenForm submitted with visible success in StackBlitz');
  const f02=liveFrame.locator('a[href*="/scenario/F02"]').first();
  await f02.click({timeout:10000});
  const order=liveFrame.locator('select[name="orderType"]');
  await order.waitFor({state:'visible',timeout:12000});
  await order.selectOption('delivery');
  await liveFrame.locator('input[name="address"]').waitFor({state:'visible',timeout:12000});
  report.checks.push('F02 conditional field works in StackBlitz');
  report.result='PASS';
  console.log('AXEN_A09_REAL_STACKBLITZ_BROWSER_PASS ' + report.checks.join('; '));
}catch(error){
  report.details = String(error).slice(0,900);
  console.error('AXEN_A09_NOT_VERIFIED '+report.details);
  process.exitCode=1;
}finally{
  mkdirSync('test-results',{recursive:true});
  writeFileSync('test-results/stackblitz-probe.json',JSON.stringify(report,null,2));
  await browser?.close();
}
