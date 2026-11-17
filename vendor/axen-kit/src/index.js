// Headless Axen Kit: trusted React/Next/portable renderer owns actual DOM and behavior.
export const KIT_VERSION='0.1.0';
const SLOT_ORDER=['header','nav','main','aside','footer'];
const COLORS={background:'#ffffff',surface:'#f8fafc',text:'#0f172a',muted:'#475569',primary:'#2563eb',border:'#cbd5e1'};
export const DEFAULT_THEME=Object.freeze({colors:Object.freeze({...COLORS}),radius:12,spacing:8});
const ID=/^[a-z][a-z0-9]*(?:[.-][a-z][a-z0-9]*)*$/;
const COMPONENT=/^[A-Z][A-Za-z0-9]*$/;
function object(value,where){
  if(!value || typeof value!=='object' || Array.isArray(value) || Object.getPrototypeOf(value)!==Object.prototype)
    throw new TypeError(where+' must be a plain object');
  return value;
}
function keys(input,allowed,where){
  for(const k of Object.keys(input))if(!allowed.includes(k))throw new TypeError('UNKNOWN_FIELD '+where+'.'+k);
}
function id(value,where,pattern=ID){
  if(typeof value!=='string' || !pattern.test(value))throw new TypeError('INVALID_ID '+where);
  return value;
}
export function createKitTheme(overrides={}){
  const custom=object(overrides,'theme');
  keys(custom,['colors','radius','spacing'],'theme');
  const colors=custom.colors===undefined?{}:object(custom.colors,'theme.colors');
  keys(colors,Object.keys(COLORS),'theme.colors');
  const merged={...COLORS};
  for(const [name,value] of Object.entries(colors)){
    if(typeof value!=='string'||!/^#[0-9a-fA-F]{6}$/.test(value))throw new TypeError('INVALID_COLOR '+name);
    merged[name]=value.toLowerCase();
  }
  const radius=custom.radius??DEFAULT_THEME.radius, spacing=custom.spacing??DEFAULT_THEME.spacing;
  for(const [name,value] of Object.entries({radius,spacing}))
    if(!Number.isInteger(value)||value<0||value>32)throw new TypeError('INVALID_TOKEN '+name);
  return Object.freeze({colors:Object.freeze(merged),radius,spacing});
}
export function kitCssVariables(theme=DEFAULT_THEME){
  const t=createKitTheme(theme);
  const result={};
  for(const [name,value] of Object.entries(t.colors))result['--axen-color-'+name]=value;
  result['--axen-radius']=t.radius+'px';
  result['--axen-spacing']=t.spacing+'px';
  return Object.freeze(result);
}
export function defineKitLayout(input){
  const src=object(input,'layout');
  keys(src,['id','slots'],'layout');
  const layoutId=id(src.id,'layout.id');
  if(!Array.isArray(src.slots))throw new TypeError('layout.slots must be array');
  const seen=new Set();
  const slots=src.slots.map((raw,i)=>{
    const slot=object(raw,'layout.slots['+i+']');
    keys(slot,['name','component','props'],'slot');
    if(!SLOT_ORDER.includes(slot.name))throw new TypeError('UNKNOWN_SLOT '+slot.name);
    if(seen.has(slot.name))throw new TypeError('DUPLICATE_SLOT '+slot.name);
    seen.add(slot.name);
    const component=id(slot.component,'slot.component',COMPONENT);
    const props=slot.props===undefined?{}:object(slot.props,'slot.props');
    // Props stay data-only; all event handlers/controllers live in the renderer and axen-form.
    for(const [key,value] of Object.entries(props)){
      id(key,'slot.prop',/^[a-zA-Z][a-zA-Z0-9]*$/);
      if(!['string','number','boolean'].includes(typeof value) && value!==null)
        throw new TypeError('NON_SCALAR_PROP '+key);
      if(typeof value==='number'&&!Number.isFinite(value))throw new TypeError('NON_SCALAR_PROP '+key);
    }
    return Object.freeze({name:slot.name,component,props:Object.freeze({...props})});
  }).sort((a,b)=>SLOT_ORDER.indexOf(a.name)-SLOT_ORDER.indexOf(b.name));
  if(!seen.has('main'))throw new TypeError('MAIN_SLOT_REQUIRED');
  return Object.freeze({id:layoutId,slots:Object.freeze(slots)});
}
// React.forwardRef (used by public axen-form AxenForm) is an object, not a function.
const FORWARD_REF=Symbol.for('react.forward_ref');
const MEMO=Symbol.for('react.memo');
function isTrustedComponent(value,seen=new Set()){
  if(typeof value==='function')return true;
  if(!value || typeof value!=='object' || Array.isArray(value) || seen.has(value))return false;
  seen.add(value);
  if(value["$$typeof"]===FORWARD_REF)return typeof value.render==='function';
  if(value["$$typeof"]===MEMO)return isTrustedComponent(value.type,seen);
  return false;
}
export function resolveKitLayout(layout,registry,overrides={},runtimeProps={}){
  const value=defineKitLayout(layout);
  const components=object(registry,'registry'), custom=object(overrides,'slot overrides');
  const injected=object(runtimeProps,'runtime props');
  const active=new Set(value.slots.map(x=>x.name));
  for(const [slot,key] of Object.entries(custom)){
    if(!active.has(slot))throw new TypeError('UNKNOWN_OVERRIDE_SLOT '+slot);
    id(key,'override.component',COMPONENT);
  }
  for(const [slot,props] of Object.entries(injected)){
    if(!active.has(slot))throw new TypeError('UNKNOWN_RUNTIME_SLOT '+slot);
    object(props,'runtime props.'+slot);
  }
  return Object.freeze(value.slots.map(slot=>{
    const name=custom[slot.name]??slot.component;
    if(!Object.hasOwn(components,name) || !isTrustedComponent(components[name]))
      throw new TypeError('UNKNOWN_COMPONENT '+name);
    // Trusted runtime props may be objects/functions (e.g. FormConfig + onSubmit).
    // Catalog/recipe slot.props remain scalar JSON only; no executable source in descriptors.
    const props=Object.freeze({...slot.props,...(injected[slot.name]||{})});
    return Object.freeze({name:slot.name,component:name,render:components[name],props});
  }));
}
