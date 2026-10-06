export function validatePassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}

export function validateEmail(email: string): boolean {
  if (!email || !email.length) {
    return false;
  }

  /* CHECK tld on 1;off 0 */
  var checkTLD = 0;

  /* Known tlds */

  var knownDomsPat = /^(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum)$/;

  /*
   * The following pattern is used to check if the entered e-mail address
   * fits the user@domain format. It also is used to separate the username
   * from the domain.
   */

  var emailPat = /^(.+)@(.+)$/;

  /*
   * The following string represents the pattern for matching all special
   * characters. We don't want to allow special characters in the address.
   * These characters include ( ) < > @ , ; : \ " . [ ]
   */

  var specialChars = '\\(\\)><@,;:\\\\\\"\\.\\[\\]';

  /*
   * The following string represents the range of characters allowed in a
   * username or domainname. It really states which chars aren't allowed.
   */

  var validChars = "[^\\s" + specialChars + "]";

  /*
   * The following pattern applies if the "user" is a quoted string (in
   * which case, there are no rules about which characters are allowed and
   * which aren't; anything goes). E.g. "jiminy cricket"@disney.com is a
   * legal e-mail address.
   */

  var quotedUser = '("[^"]*")';

  /*
   * The following pattern applies for domains that are IP addresses, rather
   * than symbolic names. E.g. joe@[123.124.233.4] is a legal e-mail
   * address. NOTE: The square brackets are required.
   */

  var ipDomainPat = /^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;

  /*
   * The following string represents an atom (basically a series of
   * non-special characters.)
   */

  var atom = validChars + "+";

  /*
   * The following string represents one word in the typical username. For
   * example, in john.doe@somewhere.com, john and doe are words. Basically,
   * a word is either an atom or quoted string.
   */

  var word = "(" + atom + "|" + quotedUser + ")";

  // The following pattern describes the structure of
  // the user

  var userPat = new RegExp("^" + word + "(\\." + word + ")*$");

  /*
   * The following pattern describes the structure of a normal symbolic
   * domain, as opposed to ipDomainPat, shown above.
   */

  var domainPat = new RegExp("^" + atom + "(\\." + atom + ")*$");

  /*
   * Finally, let's start trying to figure out if the supplied address is
   * valid.
   */

  /*
   * Begin with the coarse pattern to simply break up user@domain into
   * different pieces that are easy to analyze.
   */

  var matchArray = email.match(emailPat);

  // Nowhere near a match
  if (matchArray == null) {
    return false;
  }

  var user = matchArray[1];
  var domain = matchArray[2];

  // Start by checking that only basic ASCII
  // characters are in the strings
  // (0-127).
  for (var i = 0; i < user.length; i++) {
    if (user.charCodeAt(i) > 127) {
      return false;
    }
  }
  for (var i = 0; i < domain.length; i++) {
    if (domain.charCodeAt(i) > 127) {
      return false;
    }
  }

  // See if "user" is valid
  if (user.match(userPat) == null) {
    return false;
  }

  /*
   * if the e-mail address is at an IP address (as opposed to a symbolic
   * host name) make sure the IP address is valid.
   */
  var IPArray = domain.match(ipDomainPat);
  if (IPArray != null) {
    // this is an IP address
    for (var i = 1; i <= 4; i++) {
      if (Number(IPArray[i]) > 255) {
        return false;
      }
    }
    return true;
  }

  // Domain is symbolic name. Check if it's valid.
  var atomPat = new RegExp("^" + atom + "$");
  var domArr = domain.split(".");
  var len = domArr.length;
  for (i = 0; i < len; i++) {
    if (domArr[i].search(atomPat) == -1) {
      return false;
    }
  }

  /*
   * domain name seems valid, but now make sure that it ends in a known
   * top-level domain (like com, edu, gov) or a two-letter word,
   * representing country (uk, nl), and that there's a hostname preceding
   * the domain or country.
   */
  if (checkTLD == 1 && domArr[domArr.length - 1].length != 2 && domArr[domArr.length - 1].search(knownDomsPat) == -1) {
    return false;
  }

  // Make sure there's a host name preceding the domain.
  if (len < 2) {
    return false;
  }

  // If we've gotten this far, everything's valid!
  return true;
}