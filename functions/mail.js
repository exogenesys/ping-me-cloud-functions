
const json = require('./data/sept-1.json');
const mjml2html = require('mjml');
const options = {
    beautify: true,
    minify: true
}

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "June", "July",
    "Aug", "Sept", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();

  return day + ' ' + monthNames[monthIndex];
}

const rows = json.map(row => {

  const endDate = formatDate(new Date(row.endDate))
  const startDate = formatDate(new Date(row.startDate))

  return `
  <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;vertical-align: top;">
    <td width="30%" style="padding: 8px;">
      <a
      href="${row.link}">
        ${row.name}
      </a>
    </td>
    <td width="20%" style="padding: 8px;">
      ${row.industry}
    </td>
    <td width="10%" style="padding: 8px;">
      ${startDate}
    </td>
    <td width="10%" style="padding: 8px;">
      ${endDate}
    </td>
  </tr>
  `
})

const htmlOutput = mjml2html(`
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-text font-size="20px" color="#040404" font-family="Open Sans" line-height="1.2"" align="center" font-weight="700">PingMe</mj-text>

        <mj-divider border-color="#040404"></mj-divider>

        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">Hey, We are glad to get you onboarded!</mj-text>
        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">We have been working on a hardware start-up here in India and we've found the lack of a strong community a little too much for a hardware startup to tackle.</mj-text>
        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">At the same time, there are some amazing events happening around us, which we always managed to miss.</mj-text>
        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">To solve this issue a little bit, we've made this subscription, that will mention all the places you ought to be for your start-up to shine. Here is the list of exhibitions happening in Delhi NCR for the next two weeks.</mj-text>

      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-table>
          <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;vertical-align: bottom;">
            <th style="padding: 8px;">Name</th>
            <th style="padding: 8px;">Industry</th>
            <th style="padding: 8px;">Start Date</th>
            <th style="padding: 8px;">End Date</th>
          </tr>
          ${rows}
        </mj-table>      
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">Missing your industry? Missing some important detail? Do reply to this email for feedback. 💙
        </mj-text>
        <mj-text font-size="16px" color="#040404" font-family="Open Sans" line-height="1.2">Thanks a lot </br> Harsh </br> PingMe</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`, options)

module.exports = htmlOutput;