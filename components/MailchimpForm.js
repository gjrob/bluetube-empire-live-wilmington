// components/MailchimpForm.js
export default function MailchimpForm() {
  return (
    <form
      action="https://live.us7.list-manage.com/subscribe/post?u=08545816a9bc7addb6d782a0f&amp;id=e4326b7ebb&amp;f_id=00ad86e0f0"
      method="post"
      target="_blank"           // opens MC processing + redirect in a new tab
      noValidate
      style={{
        display:"flex",flexDirection:"column",gap:10,
        background:"#0b1220",border:"1px solid #1f2937",
        borderRadius:12,padding:16,maxWidth:400,margin:"0 auto"
      }}
    >
      <label htmlFor="mce-EMAIL" style={{fontSize:14}}>
        Email Address <span style={{color:"#f87171"}}>*</span>
      </label>

      {/* ✅ keep this input */}
      <input
        type="email"
        name="EMAIL"
        id="mce-EMAIL"
        required
        placeholder="you@email.com"
        style={{
          padding:"10px 12px",borderRadius:8,
          border:"1px solid #334155",background:"#0f172a",color:"#e5e7eb"
        }}
      />

      {/* ✅ thank-you redirect */}
      <input type="hidden" name="redirect" value="https://bluetubetv.live/thanks" />

      {/* bot trap (Mailchimp’s hidden field) */}
      <div aria-hidden="true" style={{position:"absolute",left:"-5000px"}}>
        <input type="text" name="b_08545816a9bc7addb6d782a0f_e4326b7ebb" tabIndex="-1" defaultValue="" />
      </div>

      <button
        type="submit"
        style={{
          background:"#22d3ee",color:"#0a0e27",padding:"12px 16px",
          borderRadius:8,fontWeight:800,border:"1px solid #164e63",cursor:"pointer"
        }}
      >
        Subscribe →
      </button>
    </form>
  );
}
