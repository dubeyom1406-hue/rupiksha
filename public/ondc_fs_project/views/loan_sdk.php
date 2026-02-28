<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <title>Personal Loan - Rupiksha - Powered by ONDC</title>
</head>
<body>

<div class="flex flex-col gap-12 py-5" id="requestform">

  <div class="inline-flex justify-center">
    <img class="w-24 h-24"
      src="https://ns-static-cdn.nstore.in/mall4all/logo/Logo+For+Hamara+Mall.png"/>
  </div>

  <div class="inline-flex gap-2 p-5 items-center bg-gray-100">
    <div class="basis-1/3 md:basis-1 cursor-pointer" onclick="startJourney()">
      <div class="flex flex-col gap-2 px-5 items-center">
        <div class="w-12 h-12 rounded-full border p-0.5">
          <img src="https://img.icons8.com/?size=100&id=4uLcfhJAX8QT&format=png&color=000000"
               class="w-10 h-10 rounded-full"/>
        </div>
        <p>Apply Loan</p>
      </div>
    </div>
  </div>

  <div class="flex flex-col px-8 transition-all duration-500 overflow-hidden max-h-0" id="form">
    <div class="flex flex-col gap-5">
      <p>Mobile Number</p>
      <input type="number" id="mobile_number"
             class="w-full h-10 p-2 border"
             placeholder="Enter your mobile number"/>
      <button class="h-10 px-4 bg-gray-700 text-white w-full"
              onclick="flowHandler()">Submit</button>
    </div>
  </div>

</div>

<div id="formdiv" class="h-full w-full hidden"></div>

<!-- OFFICIAL CDN SDK -->
<script src="https://cdn-js.nlincs.io/CDN-JS-Files/rupks.sdk.uat.cjs"></script>

<script>

function openWindow() {
  document.getElementById('requestform').classList.add('hidden');
  document.getElementById('formdiv').classList.remove('hidden');
}

function startJourney() {
  const form = document.getElementById('form');
  form.classList.remove('max-h-0');
  form.classList.add('max-h-[200px]');
}

function flowHandler() {
  const mobile_number = document.getElementById('mobile_number').value;

  if (!mobile_number) {
    alert('Enter mobile number');
    return;
  }

  openWindow();

  if (typeof ONDCFinanceSDK !== "undefined") {

    ONDCFinanceSDK.init({
      containerId: 'formdiv',
      flowId: 51,
      loanType: 'GL',
      data: { mobile_number }
    });

  } else {
    alert("SDK failed to load");
  }
}

</script>

</body>
</html>