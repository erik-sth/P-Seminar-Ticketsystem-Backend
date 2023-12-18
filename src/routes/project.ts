import express from 'express';
import { ProjectController } from '../controller/project';
import { isLeader } from '../middleware/isLeader';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { userWithAccess } from '../middleware/userWithAccess';

const router = express.Router();
router.get('/', [auth], ProjectController.getProjects);
router.get(
    '/:projectId',
    [auth, userWithAccess],
    ProjectController.returnProject
);

// router.get(
//     '/stats/:projectId',
//     [auth, isOrg, hasAccess, authGranted],
//     ProjectController.getEventStats
// );

router.post('/', [auth], ProjectController.createProject);

router.delete('/:projectId', [auth, isLeader], ProjectController.deleteProject);
router.patch(
    '/restore/:projectId',
    [auth, isAdmin],
    ProjectController.restoreProject
);

router.patch('/:projectId', [auth, isLeader], ProjectController.updateProject);

router.patch(
    '/addAccess/:projectId/:userId',
    [auth, isLeader],
    ProjectController.addAccessToProject
);

router.patch(
    '/removeAccess/:projectId/:userId',
    [auth, isLeader],
    ProjectController.removeAccessToProject
);

export = router;
