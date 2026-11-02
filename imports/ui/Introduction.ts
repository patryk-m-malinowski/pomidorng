import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: "app-introduction",
  imports: [RouterLink],
  host: { class: "block flex-1 min-h-0 overflow-y-auto" },
  template: `
    <div class="com-patrykmalinowski-pomidor-introduction p-5">
      <h1>Introduction to Pomidor</h1>
      <h2>What is Pomidor?</h2>
      <p>
        Pomidor is a task/todo list management app designed for individuals or
        small teams, designed to work well on both desktop and mobile devices.
      </p>
      <p>
        Anyone can create a free account and start using the app. There is no
        need to provide any personal information and the app does not collect
        any personal data about you (see
        <a routerLink="/privacy-policy">privacy policy</a> for full details).
        You are able to delete your account and the tasks you created at any
        time. In order to save server resources, accounts that have been
        inactive for over 7 days are automatically deleted along with the tasks
        they have created.
      </p>
      <p>
        You can also log in as a guest, which allows you to view the data but
        not make any changes.
      </p>
      <h2>The Tasks Manager</h2>
      <img class="max-w-lg" src="/screenshots/tasks.png" alt="Tasks manager" />
      <p>
        The Tasks Page contains three columns: "To Do", "In Progress", and
        "Done". When a task is created, it initially appears in the To Do column
        but it can be moved left or right by clicking on the left/right arrows.
      </p>
      <p>
        The app uses <b>optimistic locking</b>, meaning that any changes you
        make are immediately saved and seen by other users of this app in
        real-time. This is very similar to Google Docs and is there to prevent
        people's data being overwritten when two people edit the same field and
        then hit the Save button.
      </p>
      <p>
        Like in small teams project management tools, anyone can edit other
        people's tasks, so please don't be surprised if you see other people
        changing or deleting your tasks!
      </p>
      <p>
        To save the server's resources, each user is restricted to creating a
        maximum of 5 tasks.
      </p>
      <h2>Users manager</h2>
      <img class="max-w-lg" src="/screenshots/users.png" alt="Users manager" />
      <p>
        This app contains a simple user accounts manager. It contains a table of
        all the users registered on this system, plus a few limited options.
      </p>
      <p>
        Anyone can create 'playground' users in the users manager, which are
        temporary accounts for testing purposes. They can be logged-into just
        like normally-registered users, but also anyone can delete them or
        change their password at any time.
      </p>
      <p>
        Please note that only playground users can be edited by other users.
        Regular users (registered via the registration form) are protected and
        can only be edited by themselves.
      </p>
      <p>
        To save the server's resources, each user is restricted to creating a
        maximum of 5 accounts.
      </p>
      <h1>Enjoy!</h1>
      <a routerLink="/">Back to Home</a>
    </div>
  `,
})
export class Introduction {}
