import Route from '@ember/routing/route';
import { authenticated } from '@ascua/surreal';

export default
@authenticated
class UsersRoute extends Route {}
