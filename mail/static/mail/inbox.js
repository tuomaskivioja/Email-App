document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('', '', ''));

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;


  document.querySelector('#compose-form').onsubmit = function() {
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    })
    .catch(error => {
      console.log('Error:', error);
  });

  };

};  

function arc(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}
function unarc(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'flex';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      for (let i = 0; i < emails.length; i++) {

        let div = document.createElement('div');
        div.className = 'container';
        div.classList.add('border');
        div.classList.add('email-div');

        if (emails[i].read == false) {
          div.style.backgroundColor = 'white'
        }

        else {
          div.style.backgroundColor = '#d1cfcf'
        }
        document.querySelector('#emails-view').append(div);
        let from = document.createElement('h5');
        from.innerHTML = `<b>From:</b> ${emails[i].sender}`;
        div.append(from);
        let subject = document.createElement('h4');
        subject.innerHTML = `<b>Subject:</b> ${emails[i].subject}`;
        div.append(subject);

        let time = document.createElement('p');
        time.innerHTML = `Time: ${emails[i].timestamp}`;
        div.append(time);
        
        div.addEventListener('click', () => load_email(emails[i].id));


      }

      // ... do something else with emails ...
  });
}

function load_email(id) {

    // Show the emailand hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    document.querySelector('#email-view').innerHTML = '';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      let div = document.createElement('div');
      div.className = 'container';
      div.classList.add('border');
      div.classList.add('email-div');

      document.querySelector('#email-view').append(div);

      let from = document.createElement('h5');
      from.innerHTML = `<b>From:</b> ${email.sender}`;
      div.append(from);

      let recipients = document.createElement('h5');
      recipients.innerHTML = `<b>Recipients:</b> ${email.recipients}`;
      div.append(recipients);

      let subject = document.createElement('h4');
      subject.innerHTML = `<b>Subject:</b> ${email.subject}`;
      div.append(subject);

      let body = document.createElement('p');
      body.innerHTML = email.body;
      div.append(body);

      let time = document.createElement('p');
      time.innerHTML = `Time: ${email.timestamp}`;
      div.append(time);

      if (email.sender != document.querySelector('#user-email').innerHTML) {
        let archive = document.createElement('button');
        archive.classList.add('btn')
  
        if (email.archived == false) {
          archive.innerHTML = 'Archive'
          archive.classList.add('btn-info')
        }
        else {
          archive.innerHTML = 'Unarchive'
          archive.classList.add('btn-secondary')
        }
        div.append(archive);
        archive.addEventListener('click', function() {
  
          if (email.archived == false) {
            arc(id);
          }
  
          else {
            unarc(id);
          }
          
          load_mailbox('inbox'), 1000
  
        });
      }

      let reply = document.createElement('button');
      reply.classList.add('btn')
      reply.classList.add('btn-primary')
      reply.innerHTML = 'Reply'
      div.append(reply)
      reply.addEventListener('click', function() {
        let subject = `Re: ${email.subject}`;
        let recipient = email.sender;
        let body = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`
        compose_email(recipient, subject, body)


      })


  });

  // mark as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })



}